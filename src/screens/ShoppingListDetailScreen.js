/**
 * ShoppingListDetailScreen - Détail d'une liste de courses
 * 
 * Fonctionnalités :
 * - Affichage des items avec checkbox
 * - Groupement par catégorie
 * - Toggle checked/unchecked
 * - Suppression et archivage
 * - Ajout rapide d'items
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import {
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
  archiveShoppingList,
} from '../services/fire';

const ShoppingListDetailScreen = ({ route, navigation }) => {
  const { listId } = route.params;

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');

  useEffect(() => {
    loadListDetail();
  }, [listId]);

  const loadListDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getShoppingListById(listId);
      setList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle l'état checked d'un item
  const handleToggleItem = async (itemId) => {
    try {
      const updatedItems = list.items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );

      await updateShoppingList(listId, { items: updatedItems });
      setList({ ...list, items: updatedItems });
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  // Ajouter un nouvel item
  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert('Attention', 'Veuillez entrer le nom de l\'article');
      return;
    }

    try {
      const newItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        quantity: newItemQuantity.trim(),
        checked: false,
        category: 'Autre',
      };

      const updatedItems = [...list.items, newItem];
      await updateShoppingList(listId, { items: updatedItems });

      setList({ ...list, items: updatedItems });
      setNewItemName('');
      setNewItemQuantity('');
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  // Supprimer un item
  const handleDeleteItem = async (itemId) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous supprimer cet article ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedItems = list.items.filter((item) => item.id !== itemId);
              await updateShoppingList(listId, { items: updatedItems });
              setList({ ...list, items: updatedItems });
            } catch (err) {
              Alert.alert('Erreur', err.message);
            }
          },
        },
      ]
    );
  };

  // Archiver la liste
  const handleArchive = async () => {
    try {
      await archiveShoppingList(listId, true);
      Alert.alert('Succès', 'Liste archivée', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  // Supprimer la liste
  const handleDelete = () => {
    Alert.alert(
      'Supprimer la liste',
      'Cette action est irréversible. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteShoppingList(listId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Erreur', err.message);
            }
          },
        },
      ]
    );
  };

  // Tout décocher
  const handleUncheckAll = async () => {
    try {
      const updatedItems = list.items.map((item) => ({ ...item, checked: false }));
      await updateShoppingList(listId, { items: updatedItems });
      setList({ ...list, items: updatedItems });
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  // Grouper les items par checked/unchecked
  const groupedItems = {
    unchecked: list?.items.filter((item) => !item.checked) || [],
    checked: list?.items.filter((item) => item.checked) || [],
  };

  // États de chargement et erreur
  if (loading) {
    return <LoadingIndicator message="Chargement de la liste..." fullscreen />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={loadListDetail}
        fullscreen
      />
    );
  }

  if (!list) {
    return <ErrorMessage message="Liste introuvable" fullscreen />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.listName}>{list.name}</Text>
          <Text style={styles.itemCount}>
            {groupedItems.checked.length}/{list.items.length} articles cochés
          </Text>
        </View>

        {/* Formulaire d'ajout rapide */}
        <View style={styles.addItemForm}>
          <TextInput
            style={styles.input}
            placeholder="Nom de l'article"
            placeholderTextColor={colors.textMuted}
            value={newItemName}
            onChangeText={setNewItemName}
          />
          <TextInput
            style={[styles.input, styles.inputSmall]}
            placeholder="Quantité"
            placeholderTextColor={colors.textMuted}
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddItem}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {/* Items non cochés */}
        {groupedItems.unchecked.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À acheter</Text>
            {groupedItems.unchecked.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemRow}
                onPress={() => handleToggleItem(item.id)}
                onLongPress={() => handleDeleteItem(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.checkbox}>
                  <View style={styles.checkboxInner} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.quantity ? (
                    <Text style={styles.itemQuantity}>{item.quantity}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Items cochés */}
        {groupedItems.checked.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Terminé</Text>
              <TouchableOpacity onPress={handleUncheckAll}>
                <Text style={styles.uncheckAllText}>Tout décocher</Text>
              </TouchableOpacity>
            </View>
            {groupedItems.checked.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, styles.itemRowChecked]}
                onPress={() => handleToggleItem(item.id)}
                onLongPress={() => handleDeleteItem(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, styles.checkboxChecked]}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
                <View style={styles.itemContent}>
                  <Text style={[styles.itemName, styles.itemNameChecked]}>
                    {item.name}
                  </Text>
                  {item.quantity ? (
                    <Text style={[styles.itemQuantity, styles.itemQuantityChecked]}>
                      {item.quantity}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Message si vide */}
        {list.items.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun article pour le moment</Text>
            <Text style={styles.emptySubtext}>Ajoutez votre premier article</Text>
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.archiveButton]}
          onPress={handleArchive}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>Archiver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>Supprimer</Text>
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
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  listName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  addItemForm: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.sm,
  },
  inputSmall: {
    flex: 0,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.surface,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
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
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  uncheckAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  itemRowChecked: {
    backgroundColor: colors.surfaceLight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  itemQuantity: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemQuantityChecked: {
    color: colors.textMuted,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  archiveButton: {
    backgroundColor: colors.secondary,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.surface,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});

export default ShoppingListDetailScreen;
