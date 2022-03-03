import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Order {
  end: {
    latitude: number;
    longitude: number;
  };
  orderId: string;
  price: number;
  start: {
    latitude: number;
    longitude: number;
  };
}

interface InitialState {
  orders: Order[];
  deliveries: Order[];
}

const initialState: InitialState = {
  orders: [],
  deliveries: [],
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addOrder(state, action: PayloadAction<Order>) {
      state.orders.push(action.payload);
    },
    acceptOrder(state, action: PayloadAction<string>) {
      const index = state.orders.findIndex(
        order => order.orderId === action.payload,
      );
      if (index > -1) {
        state.deliveries.push(state.orders[index]);
        state.orders.splice(index, 1);
      }
    },
    rejectOrder(state, action: PayloadAction<string>) {
      const orderIndex = state.orders.findIndex(
        order => order.orderId === action.payload,
      );
      if (orderIndex > -1) {
        state.orders.splice(orderIndex, 1);
      }

      const deliveriesIndex = state.deliveries.findIndex(
        order => order.orderId === action.payload,
      );
      if (deliveriesIndex > -1) {
        state.deliveries.splice(deliveriesIndex, 1);
      }
    },
  },
  // extraReducers: builder => {},
});

export default orderSlice;
