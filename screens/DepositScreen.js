import React, { Component } from 'react';
import { Clipboard } from 'react-native';
import { Text, Button, Container, Header, Content, Body, Icon, Input, Item, List, ListItem, H3, Toast } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';

import addresses from '../contracts/addresses.json';

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
            <Text style={{ fontWeight: 'bold' }}>{'< VAULTEX >'}</Text>
          </Body>
        </Header>
        <Content padder style={{ paddingTop: 20 }}>
          {!this.state.depositWay && (
            <Col>
              <Text style={{ textAlign: 'center' }}>
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
              <Text style={{ textAlign: 'center' }}>
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
              <Text style={{ textAlign: 'center' }}>
                Not implemented yet
              </Text>
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
