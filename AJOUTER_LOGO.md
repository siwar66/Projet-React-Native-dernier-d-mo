## 📸 Comment ajouter le logo aux recettes

### ✅ Modifications effectuées

J'ai configuré votre application pour utiliser le logo MyRecipes comme image par défaut partout :

1. **RecipeCard** - Affiche le logo si l'image API échoue ou n'existe pas
2. **RecipeDetailScreen** - Logo par défaut pour les recettes API
3. **RecipeDetailFirebaseScreen** - Logo affiché en haut de chaque recette Firebase
4. **HomeScreen** - Logo animé sur l'écran d'accueil

### 🎯 Ce que vous devez faire maintenant

#### Étape 1 : Enregistrer l'image
1. **Faites un clic droit** sur l'image du logo que vous m'avez envoyée
2. **"Enregistrer l'image sous..."**
3. Allez dans : `C:\Users\Achref\Desktop\react_native\assets\`
4. Nommez-la exactement : **`logo.png`**

#### Étape 2 : Créer les autres versions (optionnel mais recommandé)

Pour le splash screen et les icônes :

**Option A : RAPIDE - Utiliser un générateur en ligne**
1. Allez sur **https://easyappicon.com/**
2. Uploadez votre logo
3. Téléchargez toutes les tailles
4. Placez-les dans `assets/` :
   - `icon.png` (1024x1024)
   - `splash.png` (1284x2778)
   - `adaptive-icon.png` (1024x1024)
   - `favicon.png` (48x48)

**Option B : Canva (GRATUIT)**
1. Allez sur **https://www.canva.com**
2. Créez les designs aux tailles demandées
3. Uploadez votre logo et centrez-le
4. Fond rose : **#FFF5F7** (ou violet #2A1A4A pour l'icône)
5. Téléchargez en PNG

#### Étape 3 : Structure finale

```
react_native/
├── assets/
│   ├── logo.png          ✅ (Pour l'app - OBLIGATOIRE)
│   ├── icon.png          (1024x1024 - Icône app)
│   ├── splash.png        (1284x2778 - Splash screen)
│   ├── adaptive-icon.png (1024x1024 - Android)
│   └── favicon.png       (48x48 - Web)
```

#### Étape 4 : Tester

```bash
npx expo start --clear
```

### 🎨 Résultat attendu

✅ **RecipeCard** : Logo MyRecipes si pas d'image API
✅ **HomeScreen** : Logo animé avec chapeau et cœur
✅ **RecipeDetail** : Logo en haut de l'écran
✅ **MyRecipes** : Logo pour toutes vos recettes Firebase
✅ **Splash Screen** : Logo au démarrage (si splash.png existe)

### 🔧 Troubleshooting

#### "Cannot find module '../../assets/logo.png'"
**Solution** : Vérifiez que le fichier `logo.png` existe bien dans le dossier `assets/`

#### Le logo ne s'affiche pas
**Solution** :
1. Nettoyez le cache : `npx expo start --clear`
2. Vérifiez le nom exact : **`logo.png`** (pas `Logo.png` ou `logo.jpg`)
3. Redémarrez Metro bundler

#### L'image apparaît déformée
**Solution** : Le `resizeMode="cover"` s'adapte automatiquement. Si besoin, changez en `contain` dans le code.

### 📋 Checklist rapide

- [ ] Image téléchargée et nommée `logo.png`
- [ ] Placée dans `C:\Users\Achref\Desktop\react_native\assets\`
- [ ] Cache nettoyé avec `npx expo start --clear`
- [ ] Application relancée

Une fois `logo.png` ajouté, tous vos écrans afficheront automatiquement ce magnifique logo ! 🎨✨
