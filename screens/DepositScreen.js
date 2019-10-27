import React, { Component } from 'react';
import { Clipboard } from 'react-native';
import { Text, Button, Container, Header, Content, Body, Icon, Toast } from 'native-base';
import { Col } from 'react-native-easy-grid';
import { WebView } from 'react-native-webview';

import addresses from '../contracts/addresses.json';

const wyreLink = 'https://pay.sendwyre.com/purchase?destCurrency=ETH&sourceAmount=1&dest=0x79DF43B54c31c72a3d93465bdf72317C751822B3&paymentMethod=google-pay';

export default class DepositScreen extends Component {
  state = {
    depositWay: null,
  }
  chooseDepositWay = depositWay => {
    this.setState({ depositWay });
  }
  render() {
    return (
      <Container>
        <Header>
          <Body>
            <Text style={{ fontWeight: 'bold', color: '#007aff' }}>{'< V A U L T E X >'}</Text>
          </Body>
        </Header>
        <Content padder style={{ paddingTop: 20 }}>
          {!this.state.depositWay && (
            <Col>
              <Text style={{ textAlign: 'center', color: '#4f4f4f' }}>
                Choose the way to deposit
              </Text>
              <Button block style={{ marginTop: 20 }} onPress={() => this.chooseDepositWay('crypto')}>
                <Text>Crypto</Text>
              </Button>
              <Button block style={{ marginTop: 20 }} onPress={() => this.chooseDepositWay('card')}>
                <Text>Card</Text>
              </Button>
            </Col>
          )}
          {this.state.depositWay === 'crypto' && (
            <Col>
              <Text style={{ textAlign: 'center', color: '#4f4f4f' }}>
                Send ETH to the next address and it will back you USD tokens
              </Text>
              <Text
                style={{ textAlign: 'center', fontWeight: 'bold', marginTop: 20 }}
                onPress={() => {
                  Clipboard.setString(addresses.uniswapExchanger);
                  Toast.show({ text: 'Copied to clipboard' });
                }}
              >
                {`${addresses.uniswapExchanger} `}
                <Icon type='Ionicons' name='copy' style={{ fontSize: 20 }} />
              </Text>
              <Button block style={{ marginTop: 20 }} onPress={() => this.chooseDepositWay(null)}>
                <Text>Cancel</Text>
              </Button>
            </Col>
          )}
          {this.state.depositWay === 'card' && (
            <Col> 
              <WebView
                source={{ uri: wyreLink }}
                style={{ height: 440 }}
              />
              <Button block style={{ marginTop: 20 }} onPress={() => this.chooseDepositWay(null)}>
                <Text>Cancel</Text>
              </Button>
            </Col>
          )}
        </Content>
      </Container>
    );
  }
}

DepositScreen.navigationOptions = {
  header: null,
};
