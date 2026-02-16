/**
 * App.js - Point d'entrée de l'application MyRecipes
 * 
 * Configuration de React Navigation avec Stack Navigator
 * Design futuriste avec transitions animées
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, typography } from './src/theme';

// Import des écrans
import HomeScreen from './src/screens/HomeScreen';
import RecipeListScreen from './src/screens/RecipeListScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import MyRecipesScreen from './src/screens/MyRecipesScreen';
import RecipeDetailFirebaseScreen from './src/screens/RecipeDetailFirebaseScreen';
import RecipeFormScreen from './src/screens/RecipeFormScreen';
import ShoppingListsScreen from './src/screens/ShoppingListsScreen';
import ShoppingListDetailScreen from './src/screens/ShoppingListDetailScreen';
import CreateShoppingListScreen from './src/screens/CreateShoppingListScreen';

const Stack = createNativeStackNavigator();

// Configuration du thème de navigation
const navigationTheme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.glassBorder,
    notification: colors.primary,
  },
};

// Options de header communes
const screenOptions = {
  headerStyle: {
    backgroundColor: colors.surface,
  },
  headerTintColor: colors.text,
  headerTitleStyle: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
  },
  headerShadowVisible: false,
  // Animations
  animation: 'slide_from_right',
};

export default function App() {
  return (
    <>
      {/* Barre de statut */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />
      
      {/* Navigation */}
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={screenOptions}
        >
          {/* TP2 : Écran d'accueil */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'MyRecipes',
              headerShown: true,
            }}
          />
          
          {/* TP2 : Liste des recettes API */}
          <Stack.Screen
            name="RecipeList"
            component={RecipeListScreen}
            options={{
              title: 'Recettes API',
            }}
          />
          
          {/* TP2 : Détail d'une recette API */}
          <Stack.Screen
            name="RecipeDetail"
            component={RecipeDetailScreen}
            options={{
              title: 'Détail de la recette',
            }}
          />
          
          {/* TP3 : Liste des recettes Firebase */}
          <Stack.Screen
            name="MyRecipes"
            component={MyRecipesScreen}
            options={{
              title: 'Mes Recettes',
            }}
          />
          
          {/* TP3 : Détail d'une recette Firebase */}
          <Stack.Screen
            name="RecipeDetailFirebase"
            component={RecipeDetailFirebaseScreen}
            options={{
              title: 'Ma Recette',
            }}
          />
          
          {/* TP3 : Formulaire création/édition */}
          <Stack.Screen
            name="RecipeForm"
            component={RecipeFormScreen}
            options={{
              title: 'Formulaire',
              presentation: 'modal', // Présentation modale
            }}
          />
          
          {/* LISTES DE COURSES */}
          <Stack.Screen
            name="ShoppingLists"
            component={ShoppingListsScreen}
            options={{
              title: 'Listes de Courses',
            }}
          />
          
          <Stack.Screen
            name="ShoppingListDetail"
            component={ShoppingListDetailScreen}
            options={{
              title: 'Ma Liste',
            }}
          />
          
          <Stack.Screen
            name="CreateShoppingList"
            component={CreateShoppingListScreen}
            options={{
              title: 'Nouvelle Liste',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
