import React from 'react';
import { StackNavigator } from 'react-navigation';

import Home from './containers/Home';
import MovieDetail from './containers/MovieDetail';

const RootStack = StackNavigator(
  {
    Home: {
      screen: Home,
    },
    MovieDetail: {
      screen: MovieDetail,
    },
  },
  {
    initialRouteName: 'Home',
  }
);

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}
