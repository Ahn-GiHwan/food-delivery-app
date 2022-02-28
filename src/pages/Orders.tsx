import React from 'react';
import {Text, SafeAreaView} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store/reducer';

function Orders() {
  const {orders} = useSelector((state: RootState) => state.order);
  return (
    <SafeAreaView
      style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Orders</Text>
      <Text>{orders.length}</Text>
    </SafeAreaView>
  );
}

export default Orders;
