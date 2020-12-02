import * as React from 'react';
import {
  Layout,
} from '@ui-kitten/components';
import 'react-native-gesture-handler';
import RecommendScreen from './RecommendScreen';
import TipScreen from './TipScreen';
import AccountButtons from '../../Profile/AccountButtons';
import SplashScreen from '../../Splash/SplashScreen';

const { LoginContext } = require('../../Profile/auth-react');

function HomeScreen(obj) {
  const { navigation, route } = obj;
  const { tab } = route.params;
  const tabView = (tab === 'Recommendations') ? RecommendScreen(obj) : TipScreen(obj);

  return (
    <Layout style={{ flex: 1 }}>
      <LoginContext.Consumer>
        {(loginState) => {
          if (!loginState.loginInfo) {
            return (
              <SplashScreen
                navigation={navigation}
              />
            );
          }

          return (
            <Layout style={{ flex: 1 }}>
              {tabView}
              <AccountButtons
                onRequestLogin={() => { navigation.navigate('Login'); }}
                onRequestRegister={() => { navigation.navigate('Register'); }}
              />
            </Layout>
          );
        }}
      </LoginContext.Consumer>
    </Layout>
  );
}

export default HomeScreen;
