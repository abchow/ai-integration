/**
 * Copyright 2019 Huawei Technologies Co., Ltd. All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import {
  StyleSheet, View, Alert,
  Platform, Text, ScrollView, Dimensions,
} from 'react-native';

import { ListItem } from 'react-native-elements';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/SimpleLineIcons';

import ParseUtil from './ParseUtil.js'

export default class DashBoard extends React.Component {
	
  static navigationOptions = {
    title: '首页',
    headerStyle: {
      backgroundColor: '#5BC2E7',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }

  constructor(props) {
    super(props);
    this.state = {
      items: [], //list to hold the response list from the server
      dataList: [],//list to pass on the response list to next level of component tree
    };
    this.updateState = this.updateState.bind(this);
  }

  componentDidMount() {
    ParseUtil.getWinesDataList(this.updateState);
  }
  updateState(hotelResults) {
    this.setState({ items: hotelResults })
  }

  render() {
    return (
      <ScrollView style={styles.scrollContainer}>
        <View>
          <ListItem
            underlayColor='transparent'
            title="产品列表"
            badge={{ value: 50, textStyle: { color: 'white' }, containerStyle: { marginTop: 0, marginRight: 50 } }}
            onPress={() => this.props.navigation.navigate('Wines')}
          />

          <ListItem
            underlayColor='transparent'
            title="智能推荐"
            onPress={() => this.props.navigation.navigate('Reco', { dataList: this.state.items })}
          />

          <ListItem
            underlayColor='transparent'
            title="我的购物车"
            onPress={() => this.props.navigation.navigate('CartCombine')}
          />

          {/* the following are empty lines used as padding  */}
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>
          <Text> </Text>

          <ActionButton buttonColor="rgba(231,76,60,1)">
            <ActionButton.Item buttonColor='#9b59b6'
              title="购物车"
              onPress={() => this.props.navigation.navigate('CartCombine')}>
              <Icon style={styles.actionButtonIcon} />
            </ActionButton.Item>

            <ActionButton.Item buttonColor='#3498db' title="好物推荐"
              onPress={() => this.props.navigation.navigate('Reco')}>
              <Icon style={styles.actionButtonIcon} />
            </ActionButton.Item>

            <ActionButton.Item buttonColor='#1abc9c' title="切换用户"
              onPress={() => {
                Alert.alert(
                  'Logout',
                  '确定登出?',
                  [
                    { text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    {
                      text: '确认', onPress: () => {
                        ParseUtil.logout();
                        this.props.navigation.navigate('Home')
                      }
                    },
                  ],
                  { cancelable: false }
                )

              }}>
              <Icon style={styles.actionButtonIcon} />
            </ActionButton.Item>
          </ActionButton>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  box: {
    margin: 4,
    width: Dimensions.get('window').width / 1 - 8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1c40f'
  }
});
