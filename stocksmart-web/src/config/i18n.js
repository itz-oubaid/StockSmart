import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.dashboard': 'Dashboard',
      'nav.products': 'Products',
      'nav.movements': 'Movements',
      'nav.suppliers': 'Suppliers',
      'nav.brands': 'Brands',
      'nav.depots': 'Warehouses',
      'nav.orders': 'Orders',
      'nav.alerts': 'Alerts',
      'nav.reports': 'Reports',
      'nav.settings': 'Settings',
      'nav.logout': 'Logout',

      // Common
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.export': 'Export',
      'common.import': 'Import',
      'common.close': 'Close',
      'common.actions': 'Actions',
      'common.status': 'Status',
      'common.created_at': 'Created',
      'common.updated_at': 'Updated',

      // Products
      'products.title': 'Products',
      'products.total': 'Total Products',
      'products.low_stock': 'Low Stock',
      'products.out_of_stock': 'Out of Stock',
      'products.warehouses': 'Warehouses',
      'products.sku': 'SKU',
      'products.name': 'Product Name',
      'products.category': 'Category',
      'products.quantity': 'Quantity',
      'products.price': 'Price',
      'products.warehouse': 'Warehouse',
      'products.add_product': 'Add Product',
      'products.search_placeholder': 'Search by name or SKU...',
      'products.lot_number': 'Lot Number',
      'products.serial_number': 'Serial Number',
      'products.expiry_date': 'Expiry Date',
      'products.status': 'Status',

      // Movements
      'movements.title': 'Stock Movements',
      'movements.today': 'Today',
      'movements.this_week': 'This Week',
      'movements.this_month': 'This Month',
      'movements.type': 'Type',
      'movements.in': 'Stock In',
      'movements.out': 'Stock Out',
      'movements.transfer': 'Transfer',
      'movements.adjustment': 'Adjustment',
      'movements.inventory': 'Inventory',
      'movements.return': 'Return',
      'movements.product': 'Product',
      'movements.quantity': 'Quantity',
      'movements.user': 'User',
      'movements.date': 'Date',

      // Suppliers
      'suppliers.title': 'Suppliers',
      'suppliers.name': 'Supplier Name',
      'suppliers.contact': 'Contact',
      'suppliers.address': 'Address',
      'suppliers.phone': 'Phone',
      'suppliers.email': 'Email',
      'suppliers.rating': 'Rating',
      'suppliers.reliability_score': 'Reliability Score',
      'suppliers.delivery_time': 'Delivery Time',

      // Orders
      'orders.title': 'Orders',
      'orders.create': 'Create Order',
      'orders.status': 'Status',
      'orders.pending': 'Pending Approval',
      'orders.approved': 'Approved',
      'orders.rejected': 'Rejected',
      'orders.ordered': 'Ordered',
      'orders.received': 'Received',

      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.welcome': 'Welcome',
      'dashboard.kpis': 'Key Performance Indicators',
      'dashboard.alerts': 'Active Alerts',
      'dashboard.recent_movements': 'Recent Movements',

      // Settings
      'settings.title': 'Settings',
      'settings.profile': 'Profile',
      'settings.language': 'Language',
      'settings.theme': 'Theme',
      'settings.notifications': 'Notifications',

      // Auth
      'auth.login': 'Login',
      'auth.logout': 'Logout',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.invalid_credentials': 'Invalid email or password',
      'auth.remember_me': 'Remember me',
      'auth.forgot_password': 'Forgot password?',

      // Errors
      'errors.required_field': 'This field is required',
      'errors.invalid_email': 'Invalid email address',
      'errors.network_error': 'Network error. Please try again.',
      'errors.unauthorized': 'You do not have permission to access this resource',
    },
  },
  fr: {
    translation: {
      // Navigation
      'nav.home': 'Accueil',
      'nav.dashboard': 'Tableau de Bord',
      'nav.products': 'Produits',
      'nav.movements': 'Mouvements',
      'nav.suppliers': 'Fournisseurs',
      'nav.brands': 'Marques',
      'nav.depots': 'Dépôts',
      'nav.orders': 'Commandes',
      'nav.alerts': 'Alertes',
      'nav.reports': 'Rapports',
      'nav.settings': 'Paramètres',
      'nav.logout': 'Déconnexion',

      // Common
      'common.save': 'Enregistrer',
      'common.cancel': 'Annuler',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.add': 'Ajouter',
      'common.search': 'Rechercher',
      'common.filter': 'Filtrer',
      'common.export': 'Exporter',
      'common.import': 'Importer',
      'common.close': 'Fermer',
      'common.actions': 'Actions',
      'common.status': 'Statut',
      'common.created_at': 'Créé le',
      'common.updated_at': 'Mis à jour le',

      // Products
      'products.title': 'Produits',
      'products.total': 'Total Produits',
      'products.low_stock': 'Stock Bas',
      'products.out_of_stock': 'Rupture de Stock',
      'products.warehouses': 'Entrepôts',
      'products.sku': 'SKU',
      'products.name': 'Nom du Produit',
      'products.category': 'Catégorie',
      'products.quantity': 'Quantité',
      'products.price': 'Prix',
      'products.warehouse': 'Entrepôt',
      'products.add_product': 'Ajouter Produit',
      'products.search_placeholder': 'Rechercher par nom ou SKU...',
      'products.lot_number': 'Numéro de Lot',
      'products.serial_number': 'Numéro de Série',
      'products.expiry_date': 'Date d\'Expiration',
      'products.status': 'Statut',

      // Movements
      'movements.title': 'Mouvements de Stock',
      'movements.today': 'Aujourd\'hui',
      'movements.this_week': 'Cette Semaine',
      'movements.this_month': 'Ce Mois',
      'movements.type': 'Type',
      'movements.in': 'Entrée',
      'movements.out': 'Sortie',
      'movements.transfer': 'Transfert',
      'movements.adjustment': 'Ajustement',
      'movements.inventory': 'Inventaire',
      'movements.return': 'Retour',
      'movements.product': 'Produit',
      'movements.quantity': 'Quantité',
      'movements.user': 'Utilisateur',
      'movements.date': 'Date',

      // Suppliers
      'suppliers.title': 'Fournisseurs',
      'suppliers.name': 'Nom du Fournisseur',
      'suppliers.contact': 'Contact',
      'suppliers.address': 'Adresse',
      'suppliers.phone': 'Téléphone',
      'suppliers.email': 'Email',
      'suppliers.rating': 'Évaluation',
      'suppliers.reliability_score': 'Score de Fiabilité',
      'suppliers.delivery_time': 'Délai de Livraison',

      // Orders
      'orders.title': 'Commandes',
      'orders.create': 'Créer Commande',
      'orders.status': 'Statut',
      'orders.pending': 'En Attente d\'Approbation',
      'orders.approved': 'Approuvée',
      'orders.rejected': 'Rejetée',
      'orders.ordered': 'Commandée',
      'orders.received': 'Reçue',

      // Dashboard
      'dashboard.title': 'Tableau de Bord',
      'dashboard.welcome': 'Bienvenue',
      'dashboard.kpis': 'Indicateurs Clés de Performance',
      'dashboard.alerts': 'Alertes Actives',
      'dashboard.recent_movements': 'Mouvements Récents',

      // Settings
      'settings.title': 'Paramètres',
      'settings.profile': 'Profil',
      'settings.language': 'Langue',
      'settings.theme': 'Thème',
      'settings.notifications': 'Notifications',

      // Auth
      'auth.login': 'Connexion',
      'auth.logout': 'Déconnexion',
      'auth.email': 'Email',
      'auth.password': 'Mot de Passe',
      'auth.invalid_credentials': 'Email ou mot de passe incorrect',
      'auth.remember_me': 'Se souvenir de moi',
      'auth.forgot_password': 'Mot de passe oublié?',

      // Errors
      'errors.required_field': 'Ce champ est obligatoire',
      'errors.invalid_email': 'Adresse email invalide',
      'errors.network_error': 'Erreur réseau. Veuillez réessayer.',
      'errors.unauthorized': 'Vous n\'avez pas la permission d\'accéder à cette ressource',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
