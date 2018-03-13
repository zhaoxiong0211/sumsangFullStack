import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const { height, width } = Dimensions.get('window');

const BASE_COLOR_BLUE = '#64b5f6';

export default class MovieDetail extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { movie } = navigation.state.params;

    return {
      title: movie.title
    };
  };

  constructor(props) {
    super(props);

    this._handleClickOverview = this._handleClickOverview.bind(this);

    this.state = {
      showFulOverview: false,
    }
  }

  _handleClickOverview() {
    this.setState({
      showFulOverview: !this.state.showFulOverview,
    })
  }

  render() {
    const { movie } = this.props.navigation.state.params;

    return (
      <ScrollView style={styles.container}>
        <View style={styles.movieImageSection}>
          <Image
            style={{width: 160, height: 240 }}
            source={{uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`}}
          />
        </View>
        <View style={styles.movieInfo}>
          <View style={styles.movieTitleSection}>
            <Text style={styles.movieTitle}>
              {movie.title}
            </Text>
          </View>
          <View style={styles.movieGenreAndReleaseDateSection}>
            <Text style={styles.movieGenreAndReleaseDate}>
              {movie.genres.join(' | ')}
            </Text>
            <Text style={styles.movieGenreAndReleaseDate}>
              {movie.release_date}
              </Text>
          </View>
          <TouchableOpacity
            onPress={this._handleClickOverview}
            style={styles.movieOverviewSection}
          >
            <Text
              style={styles.movieOverview}
              numberOfLines={ this.state.showFulOverview ? 0 : 4}
            >
              {movie.overview}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  movieImageSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(200,200,200,.2)',
  },
  movieInfo: {
    padding: 20,
  },
  movieTitleSection: {
    marginBottom: 10,
  },
  movieTitle: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 20,
  },
  movieGenreAndReleaseDateSection: {
    marginBottom: 10,
  },
  movieGenreAndReleaseDate: {
    fontSize: 14,
    color: '#bbb'
  },
  movieOverviewSection: {
    borderLeftColor: BASE_COLOR_BLUE,
    borderLeftWidth: 2,
    paddingLeft: 10,
  },
  movieOverview: {
    fontSize: 16,
    color: '#333'
  }
});
