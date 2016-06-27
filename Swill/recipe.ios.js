import Qty from 'js-quantities'
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  Navigator,
  TouchableHighlight,
  Image
} from 'react-native';

var REQUEST_URL = "https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i="

class Recipe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loaded: false,
    };
  }

  componentWillMount() {
console.log("constructor")
  }

  componentDidMount() {
    console.log("constructor")
    this.fetchData();
  }

  fetchData() {
    var drink_id = this.props.drinkId
    fetch(REQUEST_URL + drink_id)
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData)

        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseData.drinks),
          loaded: true,
        });
      })
      .done();
  }

  back(routeName, drinkCategory) {
    this.props.navigator.pop({
      name: routeName,
      passProps: {
        category: drinkCategory,
        results: drinkCategory
      }
    });
  }

  navigate(routeName, drink, ingredients) {
    this.props.navigator.push({
      name: routeName,
      passProps: {
        drink: drink,
        ingredients: ingredients
      }
    });
  }

  render() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }
    return (
      <View style={styles.container}>

        <View style={styles.nav}>
        <TouchableHighlight underlayColor={'transparent'}
          onPress={this.back.bind(this, 'recipe')}
        >
          <Text style={styles.bButton}>  &lsaquo; </Text>
        </TouchableHighlight>
        <Text style={styles.navtitle}>
        Recipe
        </Text>
        </View>
        <View style={styles.ListView}>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderRecipe.bind(this)}
            style={styles.ListView}
          />
        </View>
      </View>
    );
  }

  renderPourButton(recipe){
      return(
        <TouchableHighlight underlayColor={'transparent'}
          onPress={this.navigate.bind(this, 'guide',recipe,
           this.pairIngredientsMeasurements(recipe))}
        >
          <Text style={styles.bButton2}> &larr; Pour</Text>
        </TouchableHighlight>
      )
  }

  renderLoadingView() {
    return (
      <View style={styles.container}>
        <Text>
          Loading drinks...
        </Text>
      </View>
    );
  }

  pairIngredientsMeasurements(recipe) {
    var ingredients = {};
    console.log(recipe)
    for (key of Object.keys(recipe)) {
      if(recipe[key] && recipe[key].trim()){
        if(key.includes("strIngredient")){

          var i = ingredients[key.slice(13)];
          if(i === undefined){
            ingredients[key.slice(13)] = {
              ingredient: recipe[key]
            }
          }
          else{
            i.ingredient = recipe[key]
          }
        }
        else if(key.includes("strMeasure")){

          var i = ingredients[key.slice(10)];
          if(i === undefined){
            ingredients[key.slice(10)] = {
              measurement: recipe[key]
            }
            // this.convertToOunce(recipe[key])
          }
          else{
            i.measurement = recipe[key]
            // this.convertToOunce(recipe[key])
          }
        }
      }
    }
    return ingredients
  }


  convertToOunce(measurement) {
    if(measurement){
      var match = measurement.match(/(((\d?)(\.)?\d+\s+)|(\d+(\/)\d+))((\d+(\/)\d+))?(\s*\w+)?/);


      var substitutions = {'shot': 1.5, 'shots': 1.5, 'splash': 0.03125 , 'dash': 0.03125, 'dashes': 0.03125,  'jigger': 1.5, 'scoop': 4, 'scoops': 4, 'part': 0, 'parts': 0}

      if(match){
        var matchString = match[0];

        if(matchString.match(/(\d+(\/)\d+)/) && matchString.match(/(\d+(\/)\d+)/)[0]){
          var num = matchString.split(" ")
          if(num.length <= 2){
            numeratorDenominator = num[0].split("/")
            var decimal = parseFloat(numeratorDenominator[0])/parseFloat(numeratorDenominator[1])
            matchString = decimal +" "+ num[1]
          }
          else{
            numeratorDenominator = num[1].split("/")
            var decimal = parseFloat(num[0])+ parseFloat(numeratorDenominator[0])/parseFloat(numeratorDenominator[1])
            matchString = decimal +" "+ num[2]
          }
        }

        num = matchString.split(" ")
        if(num.length>1){
          if(substitutions[num[1]]){
            decimal = parseFloat(num[0]) * substitutions[num[1]]
            matchString = decimal + " floz"

          }
          // else if (!substitutions[num[1]] && !Qty.getUnits('volume')) {
          //   matchString= 0 + "floz"
          // }
        }

        var amount = matchString.replace(/\s+oz/, "floz").replace("tsp", "teaspoon").replace("tblsp", "tablespoon")
        showPourbutton = true

        try{
          qty = new Qty(amount);
          return qty.to('floz');
        }
        catch(e){

        }
      }
    }
  }
  // getMeasurementUnit(recipe) {
  //   var ingredients = this.pairIngredientsMeasurements(recipe)
  //   var measurements = []
  //   for (var i in ingredients) {
  //     measurements += ingredients[i].measurement.split(" ")
  //   }
  //   console.log('hello')
  //   console.log(measurements)
  //   return measurements
  // }

  displayIngredients(recipe) {
    var ingredients = this.pairIngredientsMeasurements(recipe)
    var array = []
    for (var i in ingredients) {
      array += [ingredients[i].measurement, ingredients[i].ingredient].join("")+ "\n";
    }
    return array;
  }

  displayInsructions(recipe) {
    var instructions = "";
    for (key of Object.keys(recipe)) {
        if(key.includes("strInstructions")){
              instructions= recipe[key]
            }
          }
    return instructions
  }

  displayImage(recipe) {
    var imageURL = "";
    for (key of Object.keys(recipe)) {
      if(recipe[key] && recipe[key].trim()){
        if(key.includes("strDrinkThumb")){
              imageURL= recipe[key].replace(/http/g, "https")
            }
          }
        else {
          ""
        }
        }
    return imageURL
  }


  renderRecipe(recipe) {
    var url = this.displayImage(recipe);
    if (url == "") {
      return (
        <View style={styles.container}>

          <View>
            <Text style={styles.title}>{recipe.strDrink}</Text>
            <Text style={styles.header}>Ingredients: </Text>
            <Text style={styles.text}>{this.displayIngredients(recipe)}</Text>
            <Text style={styles.header}>Instructions: </Text>
            <Text style={styles.text}>{this.displayInsructions(recipe)}{"\n"}</Text>
            <ListView
              dataSource={this.state.dataSource}
              renderRow={this.renderPourButton.bind(this)}
              style={styles.ListView}
            />
            </View>
          </View>
        );
    } else {
    return (
      <View style={styles.container}>
        <View>
          <Text style={styles.title}>{recipe.strDrink}</Text>
          <Text style={styles.header}>Ingredients: </Text>
          <Text style={styles.text}>{this.displayIngredients(recipe)}</Text>
          <Text style={styles.header}>Instructions: </Text>
          <Text style={styles.text}>{this.displayInsructions(recipe)}{"\n"}</Text>
          <Image
            style={styles.drinkImage}
            source={{uri: url}}
          />
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderPourButton.bind(this)}
            style={styles.ListView}
          />
        </View>
      </View>
    );
  }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: '#B8D8D8',
    marginTop: 24,
  paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 8,

  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#4F6367'
  },
  ListView: {
    flex: 1,

  },
  category: {
    flex: 1,
  },
  text: {
    fontSize: 16,
  },
  drinkImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  bButton: {
    backgroundColor: '#FE5F55',
    color: 'white',
    // padding: 3,
    textAlign: 'left',
    marginTop: 0,
    fontSize: 40,
    width: 55,
    // paddingBottom: 10,
    fontWeight: 'bold',
  },
  bButton2: {
    backgroundColor: '#FE5F55',
    color: 'white',
    padding: 3,
    textAlign: 'left',
    marginLeft: 19,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius:4,
    width: 85,
    paddingBottom: 10,
    fontWeight: 'bold',
  },
  navtitle: {
    marginTop: 15,
    marginLeft: 74,
    fontSize: 20,
    color: 'white',
    letterSpacing: 14,
  },
  nav: {
    marginLeft: -8,
    justifyContent: 'flex-start',
    width: 398,
    height: 50,
    backgroundColor: '#FE5F55',
    // alignItems: 'center',
    flexDirection: 'row',
  },
});

export default Recipe;
