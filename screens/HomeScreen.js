import * as WebBrowser from 'expo-web-browser';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Text, Button, Container, Header, Content, Body, Icon, Input, Item } from 'native-base';
import RNPickerSelect from 'react-native-picker-select';
import { Col, Row, Grid } from 'react-native-easy-grid';
import Web3 from 'web3';
import { fromWei, toHex } from 'web3-utils';

import addresses from '../contracts/addresses.json';
import Token from '../contracts/abis/Token.json';
import Synthetix from '../contracts/abis/Synthetix.json';

const web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/v3/c3725848586d482c91bba79cd74ca84a'));
const account = web3.eth.accounts.privateKeyToAccount('0x697F36CEDBD6767265A15B938E7D246DCF4941574A0F12C2C36882A4992FBD9E');
web3.eth.accounts.wallet.add(account);

const SETH = new web3.eth.Contract(Token, addresses.seth);
const SUSD = new web3.eth.Contract(Token, addresses.susd);
const SynthetixContract = new web3.eth.Contract(Synthetix, addresses.synthetix);

const tokens = [
  {
    label: 'sETH',
    value: 'sETH',
  },
  {
    label: 'sUSD',
    value: 'sUSD',
  },
];

const Picker = ({ value, onChange }) => (
  <RNPickerSelect
    placeholder={{}}
    items={tokens}
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
    from: 'sETH',
    to: 'sUSD',
    amount: '0',
  }
  componentDidMount() {
    this.loadBalances();
  }
  loadBalances = async () => {
    const [sethBalance, susdBalance] = await Promise.all([
      SETH.methods.balanceOf(account.address).call(),
      SUSD.methods.balanceOf(account.address).call(),
    ]);
    this.setState({
      sethBalance: fromWei(sethBalance),
      susdBalance: fromWei(susdBalance),
    });
  }
  swap = async () => {
    await SynthetixContract.methods.exchange(
      toHex(this.state.from),
      toWei(this.state.amount),
      toHex(this.state.to),
      account.address
    ).send({ from: account.address, gas: 1000000, gasPrice: 1000000000 });
    await this.loadBalances();
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
              <Text>sETH: {this.state.sethBalance}</Text>
              <Text>sUSD: {this.state.susdBalance}</Text>
            </Col>
          </Grid>
          <Grid style={{ marginTop: 20 }}>
            <Row>
              <Col>
                <Picker value={this.state.from} onChange={value => this.setState({ from: value })} />
              </Col>
              <Col style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Icon type='Ionicons' name='arrow-round-forward' style={{ fontSize: 40 }} />
              </Col>
              <Col>
                <Picker value={this.state.to} onChange={value => this.setState({ to: value })} />
              </Col>
            </Row>
          </Grid>
          <Item regular>
            <Input keyboardType="decimal-pad" value={this.state.amount} onChangeText={value => this.setState({ amount: value })} />
          </Item>
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
