import React, {useCallback, useRef, useState} from 'react';
import {ActivityIndicator, Alert, TextInput} from 'react-native';
import styled from 'styled-components/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import DismissKeyboardView from '../components/DismissKeyboardView';
import axios, {AxiosError} from 'axios';
import userSlice from '../redux/slices/user';
import {useAppDispatch} from '../redux/store';
import EncryptedStorage from 'react-native-encrypted-storage';
import useConfig from '../hooks/useConfig';

const Container = styled.SafeAreaView``;

const InputWrapper = styled.View`
  padding: 20px;
`;

const Label = styled.Text`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 20px;
`;

const Input = styled.TextInput.attrs({
  importantForAutofill: 'yes',
  placeholderTextColor: 'gray',
})`
  padding: 5px;
  border-bottom-width: 0.3px;
`;

const ButtonZone = styled.View`
  align-items: center;
`;
const LoginButton = styled.Pressable`
  margin-bottom: 10px;
  border-radius: 5px;
  padding-horizontal: 20px;
  padding-vertical: 10px;
  background-color: ${({disabled}) => (disabled ? 'gray' : 'blue')};
`;
const LoginButtonText = styled.Text`
  font-size: 16px;
  color: white;
`;
const SignUpButton = styled.Pressable``;
const SignUpButtonText = styled.Text``;

type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

function SignIn({navigation}: SignInScreenProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useAppDispatch();

  const emailRef = useRef<TextInput | any>(null);
  const passwordRef = useRef<TextInput | any>(null);

  const URL = useConfig();

  const canGoNext = email && password;

  const onChangeEmail = useCallback(text => setEmail(text.trim()), []);
  const onChangePassword = useCallback(text => setPassword(text.trim()), []);

  const inputTypeValidation = useCallback(() => {
    if (
      !/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/.test(
        email,
      )
    ) {
      emailRef.current?.focus();
      return Alert.alert('알림', '올바른 이메일 주소가 아닙니다.');
    }
    if (!/^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@^!%*#?&]).{8,50}$/.test(password)) {
      passwordRef.current?.focus();
      return Alert.alert(
        '알림',
        '비밀번호는 영문,숫자,특수문자($@^!%*#?&)를 모두 포함하여 8자 이상 입력해야합니다.',
      );
    }
    return true;
  }, [email, password]);

  const onSubmit = useCallback(async () => {
    if (loading) {
      return;
    }
    if (inputTypeValidation()) {
      try {
        setLoading(true);
        const {
          data: {data},
        } = await axios.post(`${URL}/login`, {email, password});
        dispatch(
          userSlice.actions.setUser({
            email: data.email,
            name: data.name,
            accessToken: data.accessToken,
          }),
        );

        await EncryptedStorage.setItem('refreshToken', data.refreshToken);

        Alert.alert('알림', '로그인이 완료되었습니다.');
      } catch (error) {
        const errorResponse = (error as AxiosError).response;
        if (errorResponse) {
          Alert.alert('알림', errorResponse.data.message);
        }
      } finally {
        setLoading(false);
      }
    }
  }, [URL, dispatch, email, inputTypeValidation, loading, password]);

  const goSignUp = useCallback(() => {
    navigation.navigate('SignUp');
  }, [navigation]);

  return (
    <DismissKeyboardView>
      <Container>
        <InputWrapper>
          <Label>이메일</Label>
          <Input
            placeholder="이메일을 입력해주세요."
            placeholderTextColor="gray"
            value={email}
            onChangeText={onChangeEmail}
            ref={emailRef}
            onSubmitEditing={() => passwordRef.current?.focus()}
            autoCompleteType="email"
            keyboardType="email-address"
            clearButtonMode="while-editing"
          />
        </InputWrapper>
        <InputWrapper>
          <Label>비밀번호</Label>
          <Input
            placeholder="비밀번호를 입력해주세요."
            value={password}
            onChangeText={onChangePassword}
            ref={passwordRef}
            onSubmitEditing={onSubmit}
            secureTextEntry
            autoCompleteType="password"
          />
        </InputWrapper>
        <ButtonZone>
          <LoginButton onPress={onSubmit} disabled={!canGoNext || loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <LoginButtonText>로그인</LoginButtonText>
            )}
          </LoginButton>
          <SignUpButton onPress={goSignUp}>
            <SignUpButtonText>회원가입하기</SignUpButtonText>
          </SignUpButton>
        </ButtonZone>
      </Container>
    </DismissKeyboardView>
  );
}

export default SignIn;
