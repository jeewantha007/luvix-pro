// Translation utility for the application
export interface Translations {
  settings: {
    title: string;
    account: string;
    appearance: string;
    support: string;
    data: string;
    profile: string;
    privacy: string;
    notifications: string;
    storageAndData: string;
    theme: string;
    language: string;
    help: string;
    about: string;
    clearChatHistory: string;
    logOut: string;
    lightMode: string;
    darkMode: string;
    deleteAllMessages: string;
    signOutOfLuvix: string;
    version: string;
    helpCenter: string;
    contactUs: string;
    terms: string;
  };
  language: {
    title: string;
    selectLanguage: string;
    currentLanguage: string;
    cancel: string;
  };
  chat: {
    welcomeToLuvix: string;
    selectConversation: string;
    startNewChat: string;
    typeMessage: string;
    media: string;
    contactInfo: string;
    copied: string;
    lastSeen: string;
    participants: string;
    loadingOlderMessages: string;
    today: string;
    yesterday: string;
    typing: string;
  };
  broadcast: {
    title: string;
    createGroup: string;
    groupsList: string;
    sendToMultiple: string;
    createGroupWithMembers: string;
    viewAndManage: string;
    broadcast: string;
    message: string;
    typeBroadcastMessage: string;
    selectGroup: string;
    sendToSelectedOnly: string;
    messageAssociatedWithGroup: string;
    recentBroadcastMessages: string;
    mediaFiles: string;
    addFiles: string;
    preview: string;
    scheduleMessage: string;
    schedule: string;
    scheduled: string;
    messageWillBeSent: string;
    recipients: string;
    contacts: string;
    groupSelected: string;
    startTypingMessage: string;
    broadcastPreviewHere: string;
    enterGroupName: string;
    groupPreviewHere: string;
    noGroupsYet: string;
    createFirstGroup: string;
    members: string;
    member: string;
    noGroupsAvailable: string;
    loadingGroups: string;
    groupName: string;
    enterGroupNamePlaceholder: string;
    selectedMembers: string;
    contact: string;
    groupCreatedSuccessfully: string;
    failedToCreateGroup: string;
    unexpectedError: string;
    creating: string;
    creatingGroup: string;
    sending: string;
    sendingBroadcast: string;
    scheduleBroadcast: string;
    sendBroadcast: string;
    invalidFileType: string;
    fileSizeLimit: string;
    failedToUpload: string;
    failedToSaveBroadcast: string;
    failedToSendBroadcast: string;
    livePreview: string;
    now: string;
    yourBrowserNotSupport: string;
    previewNotAvailable: string;
    noGroups: string;
  };
  common: {
    online: string;
    offline: string;
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    sort: string;
    refresh: string;
    upload: string;
    download: string;
    view: string;
  };
  chatList: {
    title: string;
    brandName: string;
    ai: string;
    aiMessagingOn: string;
    aiMessagingOff: string;
    searchConversations: string;
    broadcastMessage: string;
    noConversationsYet: string;
    startNewChatToConnect: string;
    noMessagesYet: string;
  };
}

const translations: { [key: string]: Translations } = {
  en: {
    settings: {
      title: 'Settings',
      account: 'Account',
      appearance: 'Appearance',
      support: 'Support',
      data: 'Data',
      profile: 'Profile',
      privacy: 'Privacy',
      notifications: 'Notifications',
      storageAndData: 'Storage and Data',
      theme: 'Theme',
      language: 'Language',
      help: 'Help',
      about: 'About',
      clearChatHistory: 'Clear Chat History',
      logOut: 'Log Out',
      lightMode: 'Light mode',
      darkMode: 'Dark mode',
      deleteAllMessages: 'Delete all messages',
      signOutOfLuvix: 'Sign out of LUVIX',
      version: 'Version 1.0.0',
      helpCenter: 'Help center, contact us, terms',
      contactUs: 'Contact us',
      terms: 'Terms of service'
    },
    language: {
      title: 'Language',
      selectLanguage: 'Select your preferred language',
      currentLanguage: 'Current Language',
      cancel: 'Cancel'
    },
    chat: {
      welcomeToLuvix: 'Welcome to LUVIX',
      selectConversation: 'Select a conversation to start messaging, or create a new chat to connect with friends and colleagues.',
      startNewChat: 'Start New Chat',
      typeMessage: 'Type a message...',
      media: 'Media',
      contactInfo: 'Contact Info',
      copied: 'Copied!',
      lastSeen: 'Last seen',
      participants: 'participants',
      loadingOlderMessages: 'Loading older messages…',
      today: 'Today',
      yesterday: 'Yesterday',
      typing: 'typing'
    },
    broadcast: {
      title: 'Broadcast Message',
      createGroup: 'Create New Group',
      groupsList: 'Groups List',
      sendToMultiple: 'Send a message to multiple contacts',
      createGroupWithMembers: 'Create a group with selected members',
      viewAndManage: 'View and manage your groups',
      broadcast: 'Broadcast',
      message: 'Message',
      typeBroadcastMessage: 'Type your broadcast message...',
      selectGroup: 'Select Group (Optional)',
      sendToSelectedOnly: 'Send to selected contacts only',
      messageAssociatedWithGroup: 'Message will be associated with group ID:',
      recentBroadcastMessages: 'Recent Broadcast Messages',
      mediaFiles: 'Media Files',
      addFiles: 'Add Files',
      preview: 'Preview',
      scheduleMessage: 'Schedule Message',
      schedule: 'Schedule',
      scheduled: 'Scheduled',
      messageWillBeSent: 'Message will be sent on',
      recipients: 'Recipients:',
      contacts: 'contacts',
      groupSelected: '+ Group selected',
      startTypingMessage: 'Start typing your message',
      broadcastPreviewHere: 'Your broadcast preview will appear here',
      enterGroupName: 'Enter a group name',
      groupPreviewHere: 'Group preview will appear here',
      noGroupsYet: 'No groups yet',
      createFirstGroup: 'Create your first group to get started',
      members: 'members',
      member: 'member',
      noGroupsAvailable: 'No groups available',
      loadingGroups: 'Loading groups...',
      groupName: 'Group Name',
      enterGroupNamePlaceholder: 'Enter group name...',
      selectedMembers: 'Selected members:',
      contact: 'contact',
      groupCreatedSuccessfully: 'Group created successfully!',
      failedToCreateGroup: 'Failed to create group in database',
      unexpectedError: 'An unexpected error occurred while creating the group',
      creating: 'Creating...',
      creatingGroup: 'Creating Group',
      sending: 'Sending...',
      sendingBroadcast: 'Sending Broadcast',
      scheduleBroadcast: 'Schedule Broadcast',
      sendBroadcast: 'Send Broadcast',
      invalidFileType: 'Invalid file type. Please select an image, video, PDF, Word document, or text file.',
      fileSizeLimit: 'File size must be less than 10MB.',
      failedToUpload: 'Failed to upload media file',
      failedToSaveBroadcast: 'Failed to save broadcast message to database',
      failedToSendBroadcast: 'Failed to send broadcast message. Please try again.',
      livePreview: 'Live Preview',
      now: 'Now',
      yourBrowserNotSupport: 'Your browser does not support the video tag.',
      previewNotAvailable: 'Preview not available for this file type',
      noGroups: 'No groups'
    },
    common: {
      online: 'Online',
      offline: 'Offline',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      refresh: 'Refresh',
      upload: 'Upload',
      download: 'Download',
      view: 'View'
    },
    chatList: {
      title: 'Chats',
      brandName: 'LUVIX',
      ai: 'AI',
      aiMessagingOn: 'AI Messaging On',
      aiMessagingOff: 'AI Messaging Off',
      searchConversations: 'Search conversations...',
      broadcastMessage: 'Broadcast Message',
      noConversationsYet: 'No conversations yet',
      startNewChatToConnect: 'Start a new chat to connect with friends and colleagues.',
      noMessagesYet: 'No messages yet'
    }
  },
  es: {
    settings: {
      title: 'Configuración',
      account: 'Cuenta',
      appearance: 'Apariencia',
      support: 'Soporte',
      data: 'Datos',
      profile: 'Perfil',
      privacy: 'Privacidad',
      notifications: 'Notificaciones',
      storageAndData: 'Almacenamiento y Datos',
      theme: 'Tema',
      language: 'Idioma',
      help: 'Ayuda',
      about: 'Acerca de',
      clearChatHistory: 'Borrar Historial de Chat',
      logOut: 'Cerrar Sesión',
      lightMode: 'Modo claro',
      darkMode: 'Modo oscuro',
      deleteAllMessages: 'Eliminar todos los mensajes',
      signOutOfLuvix: 'Cerrar sesión de LUVIX',
      version: 'Versión 1.0.0',
      helpCenter: 'Centro de ayuda, contáctanos, términos',
      contactUs: 'Contáctanos',
      terms: 'Términos de servicio'
    },
    language: {
      title: 'Idioma',
      selectLanguage: 'Selecciona tu idioma preferido',
      currentLanguage: 'Idioma Actual',
      cancel: 'Cancelar'
    },
    chat: {
      welcomeToLuvix: 'Bienvenido a LUVIX',
      selectConversation: 'Selecciona una conversación para comenzar a chatear, o crea un nuevo chat para conectar con amigos y colegas.',
      startNewChat: 'Iniciar Nuevo Chat',
      typeMessage: 'Escribe un mensaje...',
      media: 'Multimedia',
      contactInfo: 'Información de Contacto',
      copied: '¡Copiado!',
      lastSeen: 'Visto por última vez',
      participants: 'participantes',
      loadingOlderMessages: 'Cargando mensajes anteriores…',
      today: 'Hoy',
      yesterday: 'Ayer',
      typing: 'escribiendo'
    },
    broadcast: {
      title: 'Mensaje de Difusión',
      createGroup: 'Crear Nuevo Grupo',
      groupsList: 'Lista de Grupos',
      sendToMultiple: 'Enviar un mensaje a múltiples contactos',
      createGroupWithMembers: 'Crear un grupo con miembros seleccionados',
      viewAndManage: 'Ver y gestionar tus grupos',
      broadcast: 'Difusión',
      message: 'Mensaje',
      typeBroadcastMessage: 'Escribe tu mensaje de difusión...',
      selectGroup: 'Seleccionar Grupo (Opcional)',
      sendToSelectedOnly: 'Enviar solo a contactos seleccionados',
      messageAssociatedWithGroup: 'El mensaje se asociará con el grupo ID:',
      recentBroadcastMessages: 'Mensajes de Difusión Recientes',
      mediaFiles: 'Archivos Multimedia',
      addFiles: 'Agregar Archivos',
      preview: 'Vista Previa',
      scheduleMessage: 'Programar Mensaje',
      schedule: 'Programar',
      scheduled: 'Programado',
      messageWillBeSent: 'El mensaje se enviará el',
      recipients: 'Destinatarios:',
      contacts: 'contactos',
      groupSelected: '+ Grupo seleccionado',
      startTypingMessage: 'Comienza a escribir tu mensaje',
      broadcastPreviewHere: 'Tu vista previa de difusión aparecerá aquí',
      enterGroupName: 'Ingresa un nombre de grupo',
      groupPreviewHere: 'La vista previa del grupo aparecerá aquí',
      noGroupsYet: 'Aún no hay grupos',
      createFirstGroup: 'Crea tu primer grupo para comenzar',
      members: 'miembros',
      member: 'miembro',
      noGroupsAvailable: 'No hay grupos disponibles',
      loadingGroups: 'Cargando grupos...',
      groupName: 'Nombre del Grupo',
      enterGroupNamePlaceholder: 'Ingresa nombre del grupo...',
      selectedMembers: 'Miembros seleccionados:',
      contact: 'contacto',
      groupCreatedSuccessfully: '¡Grupo creado exitosamente!',
      failedToCreateGroup: 'Error al crear grupo en la base de datos',
      unexpectedError: 'Ocurrió un error inesperado al crear el grupo',
      creating: 'Creando...',
      creatingGroup: 'Creando Grupo',
      sending: 'Enviando...',
      sendingBroadcast: 'Enviando Difusión',
      scheduleBroadcast: 'Programar Difusión',
      sendBroadcast: 'Enviar Difusión',
      invalidFileType: 'Tipo de archivo inválido. Por favor selecciona una imagen, video, PDF, documento Word o archivo de texto.',
      fileSizeLimit: 'El tamaño del archivo debe ser menor a 10MB.',
      failedToUpload: 'Error al subir archivo multimedia',
      failedToSaveBroadcast: 'Error al guardar mensaje de difusión en la base de datos',
      failedToSendBroadcast: 'Error al enviar mensaje de difusión. Por favor intenta de nuevo.',
      livePreview: 'Vista Previa en Vivo',
      now: 'Ahora',
      yourBrowserNotSupport: 'Tu navegador no soporta la etiqueta de video.',
      previewNotAvailable: 'Vista previa no disponible para este tipo de archivo',
      noGroups: 'Sin grupos'
    },
    common: {
      online: 'En línea',
      offline: 'Desconectado',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      refresh: 'Actualizar',
      upload: 'Subir',
      download: 'Descargar',
      view: 'Ver'
    },
    chatList: {
      title: 'Chats',
      brandName: 'LUVIX',
      ai: 'IA',
      aiMessagingOn: 'Mensajería IA Activada',
      aiMessagingOff: 'Mensajería IA Desactivada',
      searchConversations: 'Buscar conversaciones...',
      broadcastMessage: 'Mensaje de Difusión',
      noConversationsYet: 'Aún no hay conversaciones',
      startNewChatToConnect: 'Inicia una nueva conversación para conectarte con amigos y colegas.',
      noMessagesYet: 'Aún no hay mensajes'
    }
  },
  fr: {
    settings: {
      title: 'Paramètres',
      account: 'Compte',
      appearance: 'Apparence',
      support: 'Support',
      data: 'Données',
      profile: 'Profil',
      privacy: 'Confidentialité',
      notifications: 'Notifications',
      storageAndData: 'Stockage et Données',
      theme: 'Thème',
      language: 'Langue',
      help: 'Aide',
      about: 'À propos',
      clearChatHistory: 'Effacer l\'historique des chats',
      logOut: 'Se déconnecter',
      lightMode: 'Mode clair',
      darkMode: 'Mode sombre',
      deleteAllMessages: 'Supprimer tous les messages',
      signOutOfLuvix: 'Se déconnecter de LUVIX',
      version: 'Version 1.0.0',
      helpCenter: 'Centre d\'aide, contactez-nous, conditions',
      contactUs: 'Contactez-nous',
      terms: 'Conditions d\'utilisation'
    },
    language: {
      title: 'Langue',
      selectLanguage: 'Sélectionnez votre langue préférée',
      currentLanguage: 'Langue Actuelle',
      cancel: 'Annuler'
    },
    chat: {
      welcomeToLuvix: 'Bienvenue sur LUVIX',
      selectConversation: 'Sélectionnez une conversation pour commencer à discuter, ou créez un nouveau chat pour vous connecter avec des amis et collègues.',
      startNewChat: 'Démarrer un Nouveau Chat',
      typeMessage: 'Tapez un message...',
      media: 'Médias',
      contactInfo: 'Informations de Contact',
      copied: 'Copié !',
      lastSeen: 'Vu pour la dernière fois',
      participants: 'participants',
      loadingOlderMessages: 'Chargement des messages plus anciens…',
      today: 'Aujourd\'hui',
      yesterday: 'Hier',
      typing: 'écrit'
    },
    broadcast: {
      title: 'Message de Diffusion',
      createGroup: 'Créer un Nouveau Groupe',
      groupsList: 'Liste des Groupes',
      sendToMultiple: 'Envoyer un message à plusieurs contacts',
      createGroupWithMembers: 'Créer un groupe avec des membres sélectionnés',
      viewAndManage: 'Voir et gérer vos groupes',
      broadcast: 'Diffusion',
      message: 'Message',
      typeBroadcastMessage: 'Tapez votre message de diffusion...',
      selectGroup: 'Sélectionner un Groupe (Optionnel)',
      sendToSelectedOnly: 'Envoyer uniquement aux contacts sélectionnés',
      messageAssociatedWithGroup: 'Le message sera associé au groupe ID:',
      recentBroadcastMessages: 'Messages de Diffusion Récents',
      mediaFiles: 'Fichiers Médias',
      addFiles: 'Ajouter des Fichiers',
      preview: 'Aperçu',
      scheduleMessage: 'Programmer le Message',
      schedule: 'Programmer',
      scheduled: 'Programmé',
      messageWillBeSent: 'Le message sera envoyé le',
      recipients: 'Destinataires :',
      contacts: 'contacts',
      groupSelected: '+ Groupe sélectionné',
      startTypingMessage: 'Commencez à taper votre message',
      broadcastPreviewHere: 'Votre aperçu de diffusion apparaîtra ici',
      enterGroupName: 'Entrez un nom de groupe',
      groupPreviewHere: 'L\'aperçu du groupe apparaîtra ici',
      noGroupsYet: 'Aucun groupe pour le moment',
      createFirstGroup: 'Créez votre premier groupe pour commencer',
      members: 'membres',
      member: 'membre',
      noGroupsAvailable: 'Aucun groupe disponible',
      loadingGroups: 'Chargement des groupes...',
      groupName: 'Nom du Groupe',
      enterGroupNamePlaceholder: 'Entrez le nom du groupe...',
      selectedMembers: 'Membres sélectionnés :',
      contact: 'contact',
      groupCreatedSuccessfully: 'Groupe créé avec succès !',
      failedToCreateGroup: 'Échec de la création du groupe dans la base de données',
      unexpectedError: 'Une erreur inattendue s\'est produite lors de la création du groupe',
      creating: 'Création...',
      creatingGroup: 'Création du Groupe',
      sending: 'Envoi...',
      sendingBroadcast: 'Envoi de la Diffusion',
      scheduleBroadcast: 'Programmer la Diffusion',
      sendBroadcast: 'Envoyer la Diffusion',
      invalidFileType: 'Type de fichier invalide. Veuillez sélectionner une image, vidéo, PDF, document Word ou fichier texte.',
      fileSizeLimit: 'La taille du fichier doit être inférieure à 10 Mo.',
      failedToUpload: 'Échec du téléchargement du fichier multimédia',
      failedToSaveBroadcast: 'Échec de l\'enregistrement du message de diffusion dans la base de données',
      failedToSendBroadcast: 'Échec de l\'envoi du message de diffusion. Veuillez réessayer.',
      livePreview: 'Aperçu en Direct',
      now: 'Maintenant',
      yourBrowserNotSupport: 'Votre navigateur ne prend pas en charge la balise vidéo.',
      previewNotAvailable: 'Aperçu non disponible pour ce type de fichier',
      noGroups: 'Aucun groupe'
    },
    common: {
      online: 'En ligne',
      offline: 'Hors ligne',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      refresh: 'Actualiser',
      upload: 'Télécharger',
      download: 'Télécharger',
      view: 'Voir'
    },
    chatList: {
      title: 'Chats',
      brandName: 'LUVIX',
      ai: 'IA',
      aiMessagingOn: 'Messagerie IA Activée',
      aiMessagingOff: 'Messagerie IA Désactivée',
      searchConversations: 'Rechercher des conversations...',
      broadcastMessage: 'Message de Diffusion',
      noConversationsYet: 'Aucune conversation pour le moment',
      startNewChatToConnect: 'Démarrez une nouvelle conversation pour vous connecter avec des amis et des collègues.',
      noMessagesYet: 'Aucun message pour le moment'
    }
  },
  de: {
    settings: {
      title: 'Einstellungen',
      account: 'Konto',
      appearance: 'Erscheinungsbild',
      support: 'Support',
      data: 'Daten',
      profile: 'Profil',
      privacy: 'Datenschutz',
      notifications: 'Benachrichtigungen',
      storageAndData: 'Speicher und Daten',
      theme: 'Design',
      language: 'Sprache',
      help: 'Hilfe',
      about: 'Über',
      clearChatHistory: 'Chat-Verlauf löschen',
      logOut: 'Abmelden',
      lightMode: 'Heller Modus',
      darkMode: 'Dunkler Modus',
      deleteAllMessages: 'Alle Nachrichten löschen',
      signOutOfLuvix: 'Von LUVIX abmelden',
      version: 'Version 1.0.0',
      helpCenter: 'Hilfecenter, kontaktieren Sie uns, Bedingungen',
      contactUs: 'Kontaktieren Sie uns',
      terms: 'Nutzungsbedingungen'
    },
    language: {
      title: 'Sprache',
      selectLanguage: 'Wählen Sie Ihre bevorzugte Sprache',
      currentLanguage: 'Aktuelle Sprache',
      cancel: 'Abbrechen'
    },
    chat: {
      welcomeToLuvix: 'Willkommen bei LUVIX',
      selectConversation: 'Wählen Sie eine Konversation aus, um mit dem Messaging zu beginnen, oder erstellen Sie einen neuen Chat, um sich mit Freunden und Kollegen zu verbinden.',
      startNewChat: 'Neuen Chat starten',
      typeMessage: 'Nachricht eingeben...',
      media: 'Medien',
      contactInfo: 'Kontaktinformationen',
      copied: 'Kopiert!',
      lastSeen: 'Zuletzt gesehen',
      participants: 'Teilnehmer',
      loadingOlderMessages: 'Ältere Nachrichten werden geladen…',
      today: 'Heute',
      yesterday: 'Gestern',
      typing: 'schreibt'
    },
    broadcast: {
      title: 'Broadcast-Nachricht',
      createGroup: 'Neue Gruppe erstellen',
      groupsList: 'Gruppenliste',
      sendToMultiple: 'Nachricht an mehrere Kontakte senden',
      createGroupWithMembers: 'Gruppe mit ausgewählten Mitgliedern erstellen',
      viewAndManage: 'Ihre Gruppen anzeigen und verwalten',
      broadcast: 'Broadcast',
      message: 'Nachricht',
      typeBroadcastMessage: 'Ihre Broadcast-Nachricht eingeben...',
      selectGroup: 'Gruppe auswählen (Optional)',
      sendToSelectedOnly: 'Nur an ausgewählte Kontakte senden',
      messageAssociatedWithGroup: 'Nachricht wird mit Gruppen-ID verknüpft:',
      recentBroadcastMessages: 'Letzte Broadcast-Nachrichten',
      mediaFiles: 'Mediendateien',
      addFiles: 'Dateien hinzufügen',
      preview: 'Vorschau',
      scheduleMessage: 'Nachricht planen',
      schedule: 'Planen',
      scheduled: 'Geplant',
      messageWillBeSent: 'Nachricht wird gesendet am',
      recipients: 'Empfänger:',
      contacts: 'Kontakte',
      groupSelected: '+ Gruppe ausgewählt',
      startTypingMessage: 'Beginnen Sie mit dem Tippen Ihrer Nachricht',
      broadcastPreviewHere: 'Ihre Broadcast-Vorschau wird hier angezeigt',
      enterGroupName: 'Gruppennamen eingeben',
      groupPreviewHere: 'Gruppenvorschau wird hier angezeigt',
      noGroupsYet: 'Noch keine Gruppen',
      createFirstGroup: 'Erstellen Sie Ihre erste Gruppe, um zu beginnen',
      members: 'Mitglieder',
      member: 'Mitglied',
      noGroupsAvailable: 'Keine Gruppen verfügbar',
      loadingGroups: 'Gruppen werden geladen...',
      groupName: 'Gruppenname',
      enterGroupNamePlaceholder: 'Gruppennamen eingeben...',
      selectedMembers: 'Ausgewählte Mitglieder:',
      contact: 'Kontakt',
      groupCreatedSuccessfully: 'Gruppe erfolgreich erstellt!',
      failedToCreateGroup: 'Fehler beim Erstellen der Gruppe in der Datenbank',
      unexpectedError: 'Ein unerwarteter Fehler ist beim Erstellen der Gruppe aufgetreten',
      creating: 'Erstellen...',
      creatingGroup: 'Gruppe erstellen',
      sending: 'Senden...',
      sendingBroadcast: 'Broadcast senden',
      scheduleBroadcast: 'Broadcast planen',
      sendBroadcast: 'Broadcast senden',
      invalidFileType: 'Ungültiger Dateityp. Bitte wählen Sie ein Bild, Video, PDF, Word-Dokument oder Textdatei aus.',
      fileSizeLimit: 'Die Dateigröße muss kleiner als 10 MB sein.',
      failedToUpload: 'Fehler beim Hochladen der Mediendatei',
      failedToSaveBroadcast: 'Fehler beim Speichern der Broadcast-Nachricht in der Datenbank',
      failedToSendBroadcast: 'Fehler beim Senden der Broadcast-Nachricht. Bitte versuchen Sie es erneut.',
      livePreview: 'Live-Vorschau',
      now: 'Jetzt',
      yourBrowserNotSupport: 'Ihr Browser unterstützt das Video-Tag nicht.',
      previewNotAvailable: 'Vorschau für diesen Dateityp nicht verfügbar',
      noGroups: 'Keine Gruppen'
    },
    common: {
      online: 'Online',
      offline: 'Offline',
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      close: 'Schließen',
      back: 'Zurück',
      next: 'Weiter',
      previous: 'Zurück',
      search: 'Suchen',
      filter: 'Filter',
      sort: 'Sortieren',
      refresh: 'Aktualisieren',
      upload: 'Hochladen',
      download: 'Herunterladen',
      view: 'Anzeigen'
    },
    chatList: {
      title: 'Chats',
      brandName: 'LUVIX',
      ai: 'KI',
      aiMessagingOn: 'KI-Nachrichten aktiviert',
      aiMessagingOff: 'KI-Nachrichten deaktiviert',
      searchConversations: 'Konversationen suchen...',
      broadcastMessage: 'Broadcast-Nachricht',
      noConversationsYet: 'Noch keine Konversationen',
      startNewChatToConnect: 'Starten Sie eine neue Konversation, um sich mit Freunden und Kollegen zu verbinden.',
      noMessagesYet: 'Noch keine Nachrichten'
    }
  }
};

export const getTranslation = (language: string, key: string): string => {
  const keys = key.split('.');
  let current: unknown = translations[language] || translations['en'];
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      // Fallback to English
      current = translations['en'];
      for (const fallbackKey of keys) {
        if (current && typeof current === 'object' && fallbackKey in current) {
          current = (current as Record<string, unknown>)[fallbackKey];
        } else {
          return key; // Return the key if translation not found
        }
      }
      break;
    }
  }
  
  return typeof current === 'string' ? current : key;
};

export const getTranslations = (language: string): Translations => {
  return translations[language] || translations['en'];
};

export default translations;
