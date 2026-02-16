/**
 * CreateShoppingListScreen - Créer une nouvelle liste de courses
 * 
 * Fonctionnalités :
 * - Créer une liste depuis une recette (avec ingrédients)
 * - Créer une liste vide
 * - Nommer la liste
 * - Sélectionner/désélectionner des items
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import LoadingIndicator from '../components/LoadingIndicator';
import { createShoppingList } from '../services/fire';
import { getRecipeById } from '../services/api';

const CreateShoppingListScreen = ({ route, navigation }) => {
  const { recipeId } = route.params || {};

  const [listName, setListName] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  useEffect(() => {
    if (recipeId) {
      loadRecipeIngredients();
    }
  }, [recipeId]);

  // Charger les ingrédients d'une recette
  const loadRecipeIngredients = async () => {
    try {
      setLoadingRecipe(true);
      const recipe = await getRecipeById(recipeId);

      // Générer le nom de la liste
      setListName(`Liste - ${recipe.name}`);

      // Extraire les ingrédients
      const ingredientsList = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`ingredient${i}`];
        const measure = recipe[`measure${i}`];

        if (ingredient && ingredient.trim()) {
          ingredientsList.push({
            id: `${Date.now()}-${i}`,
            name: ingredient.trim(),
            quantity: measure ? measure.trim() : '',
            checked: false,
            selected: true,
            category: 'Ingrédients',
          });
        }
      }

      setItems(ingredientsList);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoadingRecipe(false);
    }
  };

  // Toggle la sélection d'un item
  const handleToggleItem = (itemId) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Ajouter un item manuel
  const handleAddManualItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: '',
      quantity: '',
      checked: false,
      selected: true,
      category: 'Autre',
    };
    setItems([...items, newItem]);
  };

  // Modifier un item
  const handleUpdateItem = (itemId, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  // Supprimer un item
  const handleDeleteItem = (itemId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  // Créer la liste
  const handleCreateList = async () => {
    if (!listName.trim()) {
      Alert.alert('Attention', 'Veuillez nommer votre liste');
      return;
    }

    const selectedItems = items.filter((item) => item.selected && item.name.trim());

    if (selectedItems.length === 0) {
      Alert.alert('Attention', 'Ajoutez au moins un article à votre liste');
      return;
    }

    try {
      setLoading(true);

      const listData = {
        name: listName.trim(),
        items: selectedItems.map(({ selected, ...item }) => item),
        recipeIds: recipeId ? [recipeId] : [],
      };

      await createShoppingList(listData);

      Alert.alert('Succès', 'Liste créée avec succès', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ShoppingLists'),
        },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingRecipe) {
    return <LoadingIndicator message="Chargement de la recette..." fullscreen />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Nom de la liste */}
        <View style={styles.section}>
          <Text style={styles.label}>Nom de la liste</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Courses de la semaine"
            placeholderTextColor={colors.textMuted}
            value={listName}
            onChangeText={setListName}
            autoFocus={!recipeId}
          />
        </View>

        {/* Articles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Articles ({items.length})</Text>
            <TouchableOpacity
              onPress={handleAddManualItem}
              activeOpacity={0.7}
            >
              <Text style={styles.addItemText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun article</Text>
              <Text style={styles.emptySubtext}>
                Ajoutez des articles manuellement
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                {/* Checkbox */}
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => handleToggleItem(item.id)}
                  activeOpacity={0.7}
                >
                  {item.selected && (
                    <View style={styles.checkboxChecked}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Inputs */}
                <View style={styles.itemInputs}>
                  <TextInput
                    style={styles.itemInput}
                    placeholder="Nom de l'article"
                    placeholderTextColor={colors.textMuted}
                    value={item.name}
                    onChangeText={(text) =>
                      handleUpdateItem(item.id, 'name', text)
                    }
                  />
                  <TextInput
                    style={[styles.itemInput, styles.itemInputSmall]}
                    placeholder="Qté"
                    placeholderTextColor={colors.textMuted}
                    value={item.quantity}
                    onChangeText={(text) =>
                      handleUpdateItem(item.id, 'quantity', text)
                    }
                  />
                </View>

                {/* Supprimer */}
                <TouchableOpacity
                  onPress={() => handleDeleteItem(item.id)}
                  activeOpacity={0.7}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bouton Créer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateList}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.createButtonText}>Création...</Text>
          ) : (
            <Text style={styles.createButtonText}>Créer la liste</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  addItemText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  itemInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  itemInput: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  itemInputSmall: {
    flex: 0.3,
  },
  deleteButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  deleteButtonText: {
    fontSize: 24,
    color: colors.error,
    fontWeight: typography.weights.bold,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: colors.surface,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});

export default CreateShoppingListScreen;
