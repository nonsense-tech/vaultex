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

const SETH = new web3.eth.Contract(Token, addresses.seth);
const SUSD = new web3.eth.Contract(Token, addresses.susd);
const SXAU = new web3.eth.Contract(Token, addresses.sxau);
const SynthetixContract = new web3.eth.Contract(Synthetix, addresses.synthetix);
const ExchangeRatesContract = new web3.eth.Contract(ExchangeRates, addresses.exchangeRates);

const currencies = [
  {
    label: 'sETH',
    value: 'sETH',
  },
  {
    label: 'sUSD',
    value: 'sUSD',
  },
  {
    label: 'sXAU',
    value: 'sXAU',
  },
];

const Picker = ({ value, onChange }) => (
  <RNPickerSelect
    placeholder={{}}
    items={currencies}
    onValueChange={onChange}
    style={{
      ...pickerSelectStyles,
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

export default class HomeScreen extends Component {
  state = {
    sethBalance: '0',
    susdBalance: '0',
    sxauBalance: '0',
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
    const [sethBalance, susdBalance, sxauBalance] = await Promise.all([
      SETH.methods.balanceOf(account.address).call(),
      SUSD.methods.balanceOf(account.address).call(),
      SXAU.methods.balanceOf(account.address).call(),
    ]);
    this.setState({
      sethBalance: sethBalance,
      susdBalance: susdBalance,
      sxauBalance: sxauBalance,
    });
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
  swap = async () => {
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
  onFromChange = value => {
    this.setState({ fromAmount: '0', from: value });
    this.updateToAmount('0');
  }
  onToChange = value => {
    this.setState({ to: value });
    this.updateToAmount(this.state.fromAmount);
  }
  convert = value => {
    return Number(Number(fromWei(value)).toFixed(6)).toString();
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
              <Text>sETH: {this.convert(this.state.sethBalance)}</Text>
              <Text>sUSD: {this.convert(this.state.susdBalance)}</Text>
              <Text>sXAU: {this.convert(this.state.sxauBalance)}</Text>
            </Col>
          </Grid>
          <Grid style={{ marginTop: 20 }}>
            <Row>
              <Col>
                <Picker value={this.state.from} onChange={this.onFromChange} />
              </Col>
              <Col style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Icon type='Ionicons' name='arrow-round-forward' style={{ fontSize: 40 }} />
              </Col>
              <Col>
                <Picker value={this.state.to} onChange={this.onToChange} />
              </Col>
            </Row>
          </Grid>
          <Grid style={{ marginTop: 20 }}>
            <Row>
              <Col>
                <Item regular>
                  <Input keyboardType="decimal-pad" value={this.state.fromAmount} onChangeText={this.onFromAmountChange} />
                </Item>
              </Col>
              <Col style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Icon type='Ionicons' name='menu' style={{ fontSize: 40 }} />
              </Col>
              <Col>
                <Item regular>
                  <Input keyboardType="decimal-pad" value={this.state.toAmount} onChangeText={this.onToAmountChange} />
                </Item>
              </Col>
            </Row>
          </Grid>
          <Button block style={{ marginTop: 20 }} onPress={this.swap}>
            <Text>Swap</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}

HomeScreen.navigationOptions = {
  header: null,
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
