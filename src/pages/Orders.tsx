import React, {useCallback} from 'react';
import styled from 'styled-components/native';
import {useSelector} from 'react-redux';
import {Order} from '../redux/slices/order';
import {RootState} from '../redux/store/reducer';
import EachOrder from '../components/EachOrder';

const Container = styled.SafeAreaView``;
const FlatList = styled.FlatList``;

function Orders() {
  const {orders} = useSelector((state: RootState) => state.order);
  const renderItem = useCallback(({item}: {item: Order}) => {
    return <EachOrder item={item} />;
  }, []);

  return (
    <Container>
      <FlatList
        data={orders}
        keyExtractor={item => item.orderId}
        renderItem={renderItem}
      />
    </Container>
  );
}

export default Orders;
