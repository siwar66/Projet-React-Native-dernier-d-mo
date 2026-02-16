/**
 * ShoppingListsScreen - Liste de toutes les listes de courses
 * 
 * Fonctionnalités :
 * - Affichage des listes actives et archivées
 * - Badge de progression (items cochés/total)
 * - Bouton pour créer une nouvelle liste
 * - Navigation vers les détails
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import { subscribeToShoppingLists } from '../services/fire';

const ShoppingListsScreen = ({ navigation }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Abonnement temps réel aux listes
    const unsubscribe = subscribeToShoppingLists((data, err) => {
      if (err) {
        setError(err.message);
      } else {
        setLists(data);
        setError(null);
      }
      setLoading(false);
      setRefreshing(false);
    });

    // Nettoyage à la destruction
    return () => unsubscribe && unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
  };

  // Calculer la progression d'une liste
  const getProgress = (items) => {
    if (!items || items.length === 0) return { checked: 0, total: 0, percentage: 0 };
    
    const checked = items.filter((item) => item.checked).length;
    const total = items.length;
    const percentage = Math.round((checked / total) * 100);
    
    return { checked, total, percentage };
  };

  // Filtrer les listes actives et archivées
  const activeLists = lists.filter((list) => !list.archived);
  const archivedLists = lists.filter((list) => list.archived);

  // Rendu d'une liste
  const renderListItem = ({ item }) => {
    const progress = getProgress(item.items);
    const isCompleted = progress.percentage === 100 && progress.total > 0;

    return (
      <TouchableOpacity
        style={[styles.listCard, isCompleted && styles.listCardCompleted]}
        onPress={() => navigation.navigate('ShoppingListDetail', { listId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.listHeader}>
          <Text style={styles.listName} numberOfLines={1}>
            {item.name}
          </Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>Terminé</Text>
            </View>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress.percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress.checked}/{progress.total} articles
          </Text>
        </View>

        {item.recipeIds && item.recipeIds.length > 0 && (
          <Text style={styles.recipeCount}>
            {item.recipeIds.length} recette(s) associée(s)
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // État de chargement
  if (loading) {
    return <LoadingIndicator message="Chargement des listes..." fullscreen />;
  }

  // État d'erreur
  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => setLoading(true)}
        fullscreen
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Bouton Créer */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateShoppingList')}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonText}>+ Nouvelle Liste</Text>
      </TouchableOpacity>

      {/* Message si vide */}
      {lists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucune liste de courses</Text>
          <Text style={styles.emptySubtitle}>
            Créez votre première liste pour commencer
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...activeLists, ...archivedLists]}
          keyExtractor={(item) => item.id}
          renderItem={renderListItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={() => (
            <>
              {activeLists.length > 0 && (
                <Text style={styles.sectionTitle}>Listes Actives</Text>
              )}
            </>
          )}
          ListFooterComponent={() => (
            <>
              {archivedLists.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
                    Archivées
                  </Text>
                  {archivedLists.map((item) => (
                    <View key={item.id}>{renderListItem({ item })}</View>
                  ))}
                </>
              )}
            </>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  createButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    color: colors.surface,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listCardCompleted: {
    borderColor: colors.success,
    backgroundColor: colors.surfaceLight,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  listName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    flex: 1,
  },
  completedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: spacing.sm,
  },
  completedText: {
    color: colors.surface,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.glass,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  recipeCount: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ShoppingListsScreen;
