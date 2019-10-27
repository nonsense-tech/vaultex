import React, { Component } from 'react';
import { StyleSheet, Dimensions, Alert, View } from 'react-native';
import { Text, Button, Container, Header, Content, Body, Icon, Input, Item, List, ListItem, Spinner, Right, Left } from 'native-base';
import RNPickerSelect from 'react-native-picker-select';
import { Col, Row, Grid } from 'react-native-easy-grid';
import Web3 from 'web3';
import { fromWei, toHex, BN, toWei } from 'web3-utils';

import addresses from '../contracts/addresses.json';
import Token from '../contracts/abis/Token.json';
import Synthetix from '../contracts/abis/Synthetix.json';
import ExchangeRates from '../contracts/abis/ExchangeRates.json';

const web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/v3/c3725848586d482c91bba79cd74ca84a'));
const account = web3.eth.accounts.privateKeyToAccount('0xDF01B4DFCCA790C6695FB2BFC83925B2CD9C34C3D194DC5B20C0003E42C444BD');
web3.eth.accounts.wallet.add(account);

const SynthetixContract = new web3.eth.Contract(Synthetix, addresses.synthetix);
const ExchangeRatesContract = new web3.eth.Contract(ExchangeRates, addresses.exchangeRates);

const currencies = addresses.tokens.map(item => ({ label: item.label, value: item.name }));

const Picker = ({ value, onChange }) => (
  <RNPickerSelect
    placeholder={{}}
    items={currencies}
    onValueChange={onChange}
    style={{
      ...styles,
      iconContainer: {
        top: 10,
        right: 12,
      },
    }}
    value={value}
    useNativeAndroidPickerStyle={false}
    textInputProps={{ underlineColor: 'yellow' }}
  />
);

const CustomInput = ({ value, onChange }) => (
  <Item regular style={{ ...styles.inputContainer }}>
    <Input
      placeholder="amount"
      placeholderTextColor="#8cc4ff" 
      style={{ ...styles.input }}
      keyboardType="decimal-pad"
      value={value}
      onChangeText={onChange}
    />
  </Item>
);

export default class HomeScreen extends Component {
  state = {
    balances: addresses.tokens.map(item => ({ name: item.name, balance: '0', dollars: '0' })),
    from: 'sUSD',
    to: 'sXAU',
    fromAmount: '',
    rates: {},
    toAmount: '',
    loading: false,
    sending: false,
  }
  async componentDidMount() {
    this.setState({ loading: true });
    await this.loadRates();
    await this.loadBalances();
  }
  loadBalances = async () => {
    this.setState({ loading: true });
    const balances = await Promise.all(addresses.tokens.map(async item => {
      const contract = new web3.eth.Contract(Token, item.address);
      const balance = await contract.methods.balanceOf(account.address).call();
      return {
        name: item.name,
        label: item.label,
        balance,
        dollars: new BN(balance).mul(new BN(this.state.rates[item.name])).div(new BN(toWei('1'))),
      };
    }));
    this.setState({ balances, loading: false });
  }
  loadRates = async () => {
    const rates = {};
    await Promise.all(currencies.map(async item => {
      if (item.value === 'sUSD') {
        rates[item.value] = toWei('1');
        return;
      } 
      const rate = await ExchangeRatesContract.methods.rateForCurrency(toHex(item.value)).call();
      rates[item.value] = rate;
    }));
    this.setState({ rates });
  }
  onButtonPress = () => {
    if (!Number(this.state.fromAmount)) {
      Alert.alert('Error', 'Please, specify the amount to exchange');
      return;
    }
    Alert.alert(
      'Confirmation',
      'Please, confirm the transaction',
      [
        { text: 'Cancel', style: 'destructive' },
        { text: 'Confirm', onPress: this.exchange },
      ]
    );
  }
  exchange = async () => {
    this.setState({ sending: true });
    await SynthetixContract.methods.exchange(
      toHex(this.state.from),
      toWei(this.state.fromAmount),
      toHex(this.state.to),
      account.address
    ).send({ from: account.address, gas: 1000000, gasPrice: 1000000000 });
    this.setState({
      sending: false,
      fromAmount: '',
      toAmount: '',
    });
    await this.loadBalances();
  }
  calculateAmount = (amount, from, to) => {
    if (!amount) return '';
    const amountToSwap = new BN(toWei(Number(amount) ? amount : '0'));
    const fromRate = new BN(this.state.rates[from]);
    const toRate = new BN(this.state.rates[to]);
    return Number(this.convert(amountToSwap.mul(fromRate).div(toRate))).toString();
  }
  updateToAmount = amount => {
    const toAmount = this.calculateAmount(amount, this.state.from, this.state.to);
    this.setState({ toAmount });
  }
  updateFromAmount = amount => {
    const fromAmount = this.calculateAmount(amount, this.state.to, this.state.from);
    this.setState({ fromAmount });
  }
  onFromAmountChange = value => {
    this.setState({ fromAmount: value });
    this.updateToAmount(value);
  }
  onToAmountChange = value => {
    this.setState({ toAmount: value });
    this.updateFromAmount(value);
  }
  onFromChange = async value => {
    await this.setState({ from: value });
    this.updateToAmount(this.state.fromAmount);
  }
  onToChange = async value => {
    await this.setState({ to: value });
    this.updateToAmount(this.state.fromAmount);
  }
  convert = (value, decimals = 6) => {
    return Number(fromWei(value)).toFixed(decimals);
  }
  swap = () => {
    this.setState({
      from: this.state.to,
      to: this.state.from,
      fromAmount: this.state.toAmount,
      toAmount: this.state.fromAmount,
    });
  }
  render() {
    return (
      <Container style={{ height: Dimensions.get("window").height }}>
        <Header>
          <Left />
          <Body>
            <Text style={{ fontWeight: 'bold', color: '#007aff', width: 150, textAlign: 'center' }}>{'< V A U L T E X >'}</Text>
          </Body>
          <Right>
            <Button transparent onPress={() => { this.loadBalances(); this.loadRates(); }}>
              <Icon
                type='Ionicons'
                name='refresh'
                style={{ color: '#007aff', fontSize: 20, marginRight: 15 }}
              />
            </Button>
            
          </Right>
        </Header>
        <Content padder style={{ flex: 1 }}>
          <Grid style={{ flex: 1 }}>
            <Row
              style={{
                justifyContent: 'center',
                marginTop: 20,
              }}
            >
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#007aff' }}>
            <Text style={{
                fontSize: 18,
                paddingVertical: 5,
                paddingHorizontal: 15,
                color: '#4f4f4f'
              }}
              >YOUR ASSETS</Text>
            </View>
            
            </Row>
            <Col style={{ justifyContent: 'space-between', marginTop: 20 }}>
              {this.state.loading && (
                <Row style={{ justifyContent: 'center', alignItems: 'center', height: 138 }}>
                  <Spinner color="gray" size="small" />
                </Row>
              )}
              {!this.state.loading && ( 
                <List>
                  {this.state.balances.map(item => 
                    <ListItem key={item.name} style={{ marginLeft: 0, paddingLeft: 15 }}>
                      <Row style={{ justifyContent: 'space-between' }}>
                        <Row size={2} style={{ justifyContent: 'flex-start' }}>
                          <Text style={{ color: '#4f4f4f' }}>{item.label}</Text>
                        </Row>
                        <Row size={3} style={{ justifyContent: 'flex-end' }}>
                          <Text style={{ color: '#4f4f4f' }}>{this.convert(item.balance)}</Text>
                        </Row>
                        <Row size={3} style={{ justifyContent: 'flex-end' }}>
                          <Text style={{ color: '#4f4f4f' }}>${this.convert(item.dollars, 2)}</Text>
                        </Row>
                      </Row>
                    </ListItem>
                  )}
                </List>
              )}
              <Col style={{ marginTop: 150 }}>
                <Row>
                  <Col size={2}>
                    <Picker value={this.state.from} onChange={this.onFromChange} />
                    <CustomInput value={this.state.fromAmount} onChange={this.onFromAmountChange} />
                  </Col>
                  <Col size={1} style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Icon
                      type='Ionicons'
                      name='arrow-round-forward'
                      style={{ fontSize: 40, color: '#007aff' }}
                      onPress={this.swap}
                    />
                  </Col>
                  <Col size={2}>
                    <Picker value={this.state.to} onChange={this.onToChange} />
                    <CustomInput value={this.state.toAmount} onChange={this.onToAmountChange} />
                  </Col>
                </Row>
                <Button block style={{ marginTop: 20 }} onPress={this.onButtonPress} disabled={this.state.sending}>
                  {this.state.sending ? (
                    <Spinner color="gray" size="small" />
                  ) : (
                    <Text>Exchange</Text>
                  )}
                </Button>
              </Col>
            </Col>
          </Grid>
        </Content>
      </Container>
    );
  }
}

HomeScreen.navigationOptions = {
  header: null,
};

const inputStyles = {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#007aff',
    borderRadius: 4,
    color: '#007aff',
    textAlign: 'center',
    height: 40,
};

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 10,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    marginLeft: 0,
  },
  input: inputStyles,
  inputIOS: inputStyles,
  inputAndroid: inputStyles,
});
