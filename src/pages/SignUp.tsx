import {NativeStackScreenProps} from '@react-navigation/native-stack';
import axios, {AxiosError} from 'axios';
import React, {useCallback, useRef, useState} from 'react';
import {ActivityIndicator, Alert, TextInput} from 'react-native';
import styled from 'styled-components/native';
import {RootStackParamList} from '../../App';
import DismissKeyboardView from '../components/DismissKeyboardView';
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
const SignButton = styled.Pressable`
  margin-bottom: 10px;
  border-radius: 5px;
  padding-horizontal: 20px;
  padding-vertical: 10px;
  background-color: ${({disabled}) => (disabled ? 'gray' : 'blue')};
`;
const SignButtonText = styled.Text`
  font-size: 16px;
  color: white;
`;

type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

function SignUp({navigation}: SignInScreenProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const emailRef = useRef<TextInput | any>(null);
  const nameRef = useRef<TextInput | any>(null);
  const passwordRef = useRef<TextInput | any>(null);

  const URL = useConfig();

  const onChangeEmail = useCallback(text => setEmail(text.trim()), []);
  const onChangeName = useCallback(text => setName(text.trim()), []);
  const onChangePassword = useCallback(text => setPassword(text.trim()), []);

  const canGoNext = email && name && password;

  const inputTypeValidation = useCallback(() => {
    if (
      !/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/.test(
        email,
      )
    ) {
      emailRef.current?.focus();
      return Alert.alert('??????', '????????? ????????? ????????? ????????????.');
    }
    if (!/^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@^!%*#?&]).{8,50}$/.test(password)) {
      passwordRef.current?.focus();
      return Alert.alert(
        '??????',
        '??????????????? ??????,??????,????????????($@^!%*#?&)??? ?????? ???????????? 8??? ?????? ?????????????????????.',
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
        const {data} = await axios.post(`${URL}/user`, {
          email,
          name,
          password,
        });
        console.log(data);
        Alert.alert('??????', '??????????????? ?????????????????????.');
        navigation.navigate('SignIn');
      } catch (error) {
        const errorResponse = (error as AxiosError).response;
        if (errorResponse) {
          Alert.alert('??????', errorResponse.data.message);
        }
      } finally {
        setLoading(false);
      }
    }
  }, [loading, inputTypeValidation, URL, email, name, password, navigation]);

  return (
    <DismissKeyboardView>
      <Container>
        <InputWrapper>
          <Label>?????????</Label>
          <Input
            placeholder="???????????? ??????????????????."
            value={email}
            onChangeText={onChangeEmail}
            ref={emailRef}
            onSubmitEditing={() => nameRef.current?.focus()}
            autoCompleteType="email"
            keyboardType="email-address"
            clearButtonMode="while-editing"
          />
        </InputWrapper>
        <InputWrapper>
          <Label>??????</Label>
          <Input
            placeholder="????????? ??????????????????."
            value={name}
            onChangeText={onChangeName}
            ref={nameRef}
            onSubmitEditing={() => passwordRef.current?.focus()}
            autoCompleteType="name"
            clearButtonMode="while-editing"
          />
        </InputWrapper>
        <InputWrapper>
          <Label>????????????</Label>
          <Input
            placeholder="??????????????? ??????????????????."
            value={password}
            onChangeText={onChangePassword}
            ref={passwordRef}
            onSubmitEditing={onSubmit}
            secureTextEntry
            autoCompleteType="password"
          />
        </InputWrapper>
        <ButtonZone>
          <SignButton onPress={onSubmit} disabled={!canGoNext || loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <SignButtonText>????????????</SignButtonText>
            )}
          </SignButton>
        </ButtonZone>
      </Container>
    </DismissKeyboardView>
  );
}

export default SignUp;
