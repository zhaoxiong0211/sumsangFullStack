import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ListView,
  Image,
  Dimensions,
} from 'react-native';

const { height, width } = Dimensions.get('window');

const THE_MOVIE_DB_API_KEY = '464f40b73b4631b3d3388d329d0ae5db';
const BASE_COLOR_BLUE = '#64b5f6';

export default class Home extends React.Component {
  static navigationOptions = {
    title: 'Home',
  };

  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.genreList = {};

    this._init = this._init.bind(this);
    this._getGenreList = this._getGenreList.bind(this);
    this._updateList = this._updateList.bind(this);
    this._renderRow = this._renderRow.bind(this);
    this._hanldePressHeaderBar = this._hanldePressHeaderBar.bind(this);
    this._handlePressMovie = this._handlePressMovie.bind(this);
    this._onEndReached = this._onEndReached.bind(this);
    this._renderFooter = this._renderFooter.bind(this);
    this._handleClickTryAgain = this._handleClickTryAgain.bind(this);

    this.state = {
      listType: 'now_playing',
      movielList: [],
      dataSource: ds.cloneWithRows([]),
      currentPage: 1,
      requestError: false,
    };
  }

  componentWillMount() {
    this._init()
  }

  async _init() {
    await this._getGenreList();
    await this._updateList(this.state.listType, this.state.currentPage);
  }

  async _getGenreList() {
    const self = this;

    await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${THE_MOVIE_DB_API_KEY}&language=en-US&region=US`)
    .then(function(res) {
      if (res.ok) {
        return res.json();
      } else {
        self.setState({
          requestError: true,
        })
        return res.json()
          .then(function(err) {
            throw new Error("Get genre list error ", err);
          });
      }
    }).then(data => {
      data.genres.forEach(genre => {
        self.genreList[genre.id] = genre.name;
      })
    })
  }

  async _updateList(listType, currentPage) {
    const self = this;

    await fetch(`https://api.themoviedb.org/3/movie/${listType}?api_key=${THE_MOVIE_DB_API_KEY}&language=en-US&page=${currentPage}&region=US`)
    .then(function(res) {
      if (res.ok) {
        return res.json();
      } else {
        self.setState({
          requestError: true,
        })
        return res.json()
          .then(function(err) {
            throw new Error("Get movie list error ", err);
          });
      }
    }).then(data => {
      if (currentPage === 1) {
        self.setState({
          movielList: data.results,
          dataSource: self.state.dataSource.cloneWithRows(data.results),
        })
      } else {
        const newMovieList = self.state.movielList.concat(data.results);
        self.setState({
          movielList: newMovieList,
          dataSource: self.state.dataSource.cloneWithRows(newMovieList),
        })
      }
    })
  }

  _renderRow(rowData) {
    let genres = [];
    rowData.genre_ids.forEach(genre => {
      genres.push(this.genreList[genre]);
    })

    return (
      <TouchableOpacity
        key={rowData.id}
        onPress={() => { this._handlePressMovie(rowData, genres) }}
      >
        <View style={styles.movieItem}>
          <Image
            style={{width: 60, height: 90}}
            source={{uri: `https://image.tmdb.org/t/p/w500${rowData.poster_path}`}}
          />
          <View style={styles.movieInfo}>
            <View style={styles.movieInfoTop}>
              <Text style={styles.movieTitle}>
                {rowData.title}
              </Text>
              <Text style={styles.movieGenre}>
                {genres.join(' | ')}
              </Text>
            </View>
            <View style={styles.movieInfoBottom}>
              <Text style={styles.movieReleaseDate}>
                {`Release Date: ${rowData.release_date}`}
              </Text>
              <Text style={styles.moviePopularity}>
                {`Popularity: ${rowData.popularity}`}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  _hanldePressHeaderBar(listType) {
    if (listType !== this.state.listType) {
      const updatedState = {
        listType: listType,
        currentPage: 1,
        movielList: [],
        dataSource: this.state.dataSource.cloneWithRows([]),
      };

      try {
        this._updateList(listType, 1);
      } catch (e) {
        updatedState.requestError = true;
      }
      this.setState(updatedState);
    }
  }

  _handlePressMovie(rowData, genres) {
    rowData.genres = genres;
    this.props.navigation.navigate('MovieDetail', {
      movie: rowData,
    })
  }

  async _onEndReached() {
    const { listType, currentPage } = this.state;
    const updatedState = {
      currentPage: currentPage + 1,
    };
    try {
      await this._updateList(listType, currentPage + 1);
    } catch (e) {
      updatedState.requestError = true;
    }
    this.setState(updatedState);
  }

  async _handleClickTryAgain() {
    const { listType, currentPage } = this.state;

    try {
      if (this.genreList.length === 0) {
        await this._getGenreList();
      }

      await this._updateList(listType, currentPage);

      this.setState({
        requestError: false,
      })
    } catch (e) {
      throw new Error('Something went wrong, please try again');
    }
  }

  _renderFooter() {
    if (this.state.requestError) {
      return (
        <View style={styles.tryAgainSection}>
          <Text style={styles.somethingWrongText}>
            {'Something went wrong, please '}
          </Text>
          <TouchableOpacity onPress={this._handleClickTryAgain}>
            <Text style={styles.tryAgainText}>
              try again
            </Text>
          </TouchableOpacity>
        </View>
      )
    } else {
      return null;
    }
  }

  render() {
    const { listType } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={listType === 'now_playing' ? styles.headerBarSelected : styles.headerBar}
            onPress={() => { this._hanldePressHeaderBar('now_playing') }}
          >
            <Text style={listType === 'now_playing' ? styles.headerTitleSelected : styles.headerTitle}>
              Now Playing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={listType === 'upcoming' ? styles.headerBarSelected : styles.headerBar}
            onPress={() => { this._hanldePressHeaderBar('upcoming') }}
          >
            <Text style={listType === 'upcoming' ? styles.headerTitleSelected :  styles.headerTitle}>
              Upcoming
            </Text>
          </TouchableOpacity>
        </View>

        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          onEndReachedThreshold={200}
          onEndReached={this._onEndReached}
          renderFooter={this._renderFooter}
          enableEmptySections
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  headerBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    height: 40,
  },
  headerBarSelected: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    height: 40,
    backgroundColor: 'white',
    borderBottomColor: BASE_COLOR_BLUE,
    borderBottomWidth: 2,
  },
  headerTitle: {
    lineHeight: 40,
    color: 'gray',
  },
  headerTitleSelected: {
    lineHeight: 40,
    color: BASE_COLOR_BLUE,
    fontWeight: 'bold',
  },
  movieItem: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#bbb',
    marginBottom: 10,
    marginHorizontal: 20,
    flexDirection: 'row',
    padding: 10,
    borderRadius: 5,
  },
  movieInfo: {
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  movieTitle: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  movieReleaseDate: {
    color: '#bbb',
    fontSize: 12,
  },
  moviePopularity: {
    color: '#bbb',
    fontSize: 12,
  },
  movieInfoTop: {
    width: width - 120,
  },
  movieGenre: {
    fontSize: 12,
    color: '#333'
  },
  tryAgainSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  somethingWrongText: {
    color: '#bbb',
    fontSize: 14,
  },
  tryAgainText: {
    color: BASE_COLOR_BLUE,
    fontSize: 14,
  }
});
