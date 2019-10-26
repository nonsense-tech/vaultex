import React, { Component } from 'react';
import { Clipboard } from 'react-native';
import { Text, Button, Container, Header, Content, Body, Icon, Input, Item, List, ListItem, H3, Toast } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';

import addresses from '../contracts/addresses.json';

export default class DepositScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showToast: false
    };
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
          <Text
            style={{ textAlign: 'center' }}
          >
            Send ETH to the next address and it will back you USD tokens
          </Text>
          <Text
            style={{ textAlign: 'center', fontWeight: 'bold', marginTop: 20 }}
            onPress={() => {
              Clipboard.setString(addresses.uniswapExchanger);
              Toast.show({ text: 'Copied to clipboard' });
            }}
          >
            {addresses.uniswapExchanger}
          </Text>
        </Content>
      </Container>
    );
  }
}

DepositScreen.navigationOptions = {
  header: null,
};
