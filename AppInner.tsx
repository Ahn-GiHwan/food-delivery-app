import React, {useEffect} from 'react';
import {Alert} from 'react-native';
import axios, {AxiosError} from 'axios';
import {useSelector} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import EncryptedStorage from 'react-native-encrypted-storage';
import SplashScreen from 'react-native-splash-screen';
import useSocket from './src/hooks/useSocket';
import useConfig from './src/hooks/useConfig';
import Delivery from './src/pages/Delivery';
import Orders from './src/pages/Orders';
import Settings from './src/pages/Settings';
import SignIn from './src/pages/SignIn';
import SignUp from './src/pages/SignUp';
import {useAppDispatch} from './src/redux/store';
import {RootState} from './src/redux/store/reducer';
import userSlice from './src/redux/slices/user';
import orderSlice from './src/redux/slices/order';
import usePermissions from './src/hooks/usePermission';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AppInner() {
  const isLoggedIn = useSelector((state: RootState) => state.user.email);
  const [socket, disconnect] = useSocket();
  const URL = useConfig();
  const dispatch = useAppDispatch();

  usePermissions();

  useEffect(() => {
    const getTokenAndRefresh = async () => {
      try {
        // TODO: 스플래시 스크린 보이기
        const token = await EncryptedStorage.getItem('refreshToken');
        if (!token) {
          SplashScreen.hide();
          return;
        }
        const response = await axios({
          url: `${URL}/refreshToken`,
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        dispatch(
          userSlice.actions.setUser({
            name: response.data.data.name,
            email: response.data.data.email,
            accessToken: response.data.data.accessToken,
          }),
        );
      } catch (error) {
        console.error(error);
        if ((error as AxiosError).response?.data.code === 'expired') {
          Alert.alert('알림', '다시 로그인 해주세요.');
        }
      } finally {
        // TODO: 스플래시 스크린 없애기
        SplashScreen.hide();
      }
    };
    getTokenAndRefresh();
  }, [URL, dispatch]);

  useEffect(() => {
    const helloCallback = (data: any) => {
      console.log(data);
      dispatch(orderSlice.actions.addOrder(data));
    };
    if (socket && isLoggedIn) {
      console.log(socket);
      socket.emit('acceptOrder', 'hello');
      socket.on('order', helloCallback);
    }
    return () => {
      if (socket) {
        socket.off('order', helloCallback);
      }
    };
  }, [dispatch, isLoggedIn, socket]);

  useEffect(() => {
    if (!isLoggedIn) {
      console.log('!isLoggedIn', !isLoggedIn);
      disconnect();
    }
  }, [isLoggedIn, disconnect]);

  useEffect(() => {
    axios.interceptors.response.use(
      response => {
        return response;
      },
      async error => {
        const {
          config, // 에러났던 요청의 로직이 담겨져있음
          response: {status},
        } = error;
        if (status === 419) {
          if (error.response.data.code === 'expired') {
            const originalRequest = config;
            const refreshToken = await EncryptedStorage.getItem('refreshToken');
            // token refresh 요청
            const {data} = await axios({
              url: `${URL}/refreshToken`, // token refresh api
              method: 'POST',
              headers: {authorization: `Bearer ${refreshToken}`},
            });
            // 새로운 토큰 저장
            dispatch(userSlice.actions.setAccessToken(data.data.accessToken));
            originalRequest.headers.authorization = `Bearer ${data.data.accessToken}`;
            // 419로 요청 실패했던 요청 새로운 토큰으로 재요청
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      },
    );
  }, [URL, dispatch]);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Tab.Navigator>
          <Tab.Screen
            name="Orders"
            component={Orders}
            options={{title: '오더 목록'}}
          />
          <Tab.Screen
            name="Delivery"
            component={Delivery}
            options={{headerShown: false}}
          />
          <Tab.Screen
            name="Settings"
            component={Settings}
            options={{title: '내 정보'}}
          />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="SignIn"
            component={SignIn}
            options={{title: '로그인'}}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{title: '회원가입'}}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default AppInner;
