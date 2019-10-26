import * as WebBrowser from 'expo-web-browser';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Text, Button, Container, Header, Content, Body, Icon, Input, Item } from 'native-base';
import RNPickerSelect from 'react-native-picker-select';
import { Col, Row, Grid } from 'react-native-easy-grid';
import Web3 from 'web3';
import { fromWei, toHex, BN, toWei } from 'web3-utils';

import addresses from '../contracts/addresses.json';
import Token from '../contracts/abis/Token.json';
import Synthetix from '../contracts/abis/Synthetix.json';
import ExchangeRates from '../contracts/abis/ExchangeRates.json';

const web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/v3/c3725848586d482c91bba79cd74ca84a'));
const account = web3.eth.accounts.privateKeyToAccount('0x697F36CEDBD6767265A15B938E7D246DCF4941574A0F12C2C36882A4992FBD9E');
web3.eth.accounts.wallet.add(account);

const SynthetixContract = new web3.eth.Contract(Synthetix, addresses.synthetix);
const ExchangeRatesContract = new web3.eth.Contract(ExchangeRates, addresses.exchangeRates);

const currencies = addresses.tokens.map(item => ({ label: item.name, value: item.name }));

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
      style={{ ...styles.input }}
      keyboardType="decimal-pad"
      value={value}
      onChangeText={onChange}
    />
  </Item>
);

export default class HomeScreen extends Component {
  state = {
    balances: addresses.tokens.map(item => ({ name: item.name, balance: '0' })),
    from: 'sETH',
    to: 'sUSD',
    fromAmount: '0',
    rates: {},
    toAmount: '0',
  }
  componentDidMount() {
    this.loadBalances();
    this.loadRates();
  }
  loadBalances = async () => {
    const balances = await Promise.all(addresses.tokens.map(async item => {
      const contract = new web3.eth.Contract(Token, item.address);
      const balance = await contract.methods.balanceOf(account.address).call();
      return {
        name: item.name,
        balance,
      };
    }));
    this.setState({ balances });
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
  exchange = async () => {
    await SynthetixContract.methods.exchange(
      toHex(this.state.from),
      toWei(this.state.fromAmount),
      toHex(this.state.to),
      account.address
    ).send({ from: account.address, gas: 1000000, gasPrice: 1000000000 });
    await this.loadBalances();
  }
  calculateAmount = (amount, from, to) => {
    const amountToSwap = new BN(toWei(amount || '0'));
    const fromRate = new BN(this.state.rates[from]);
    const toRate = new BN(this.state.rates[to]);
    return this.convert(amountToSwap.mul(fromRate).div(toRate));
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
  convert = value => {
    return Number(Number(fromWei(value)).toFixed(6)).toString();
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
      <Container>
        <Header>
          <Body>
            <Text>Investix</Text>
          </Body>
        </Header>
        <Content padder>
          <Grid>
            <Col>
              {this.state.balances.map(item => 
                <Text key={item.name}>{item.name}: {this.convert(item.balance)}</Text>
              )}
            </Col>
          </Grid>
          <Grid style={{ marginTop: 20 }}>
            <Row>
              <Col>
                <Picker value={this.state.from} onChange={this.onFromChange} />
                <CustomInput value={this.state.fromAmount} onChange={this.onFromAmountChange} />
              </Col>
              <Col style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Icon type='Ionicons' name='arrow-round-forward' style={{ fontSize: 40 }} onPress={this.swap} />
              </Col>
              <Col>
                <Picker value={this.state.to} onChange={this.onToChange} />
                <CustomInput value={this.state.toAmount} onChange={this.onToAmountChange} />
              </Col>
            </Row>
          </Grid>
          <Button block style={{ marginTop: 20 }} onPress={this.exchange}>
            <Text>Exchange</Text>
          </Button>
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
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
};

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 10,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
  },
  input: inputStyles,
  inputIOS: inputStyles,
  inputAndroid: inputStyles,
});
