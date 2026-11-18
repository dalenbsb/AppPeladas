import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

import { openAppDatabase } from './expoSqliteAdapter';
import { createRepositories, type Repositories } from './repositories';
import type { SqlExecutor } from './sqlExecutor';

type DatabaseContextValue = {
  db: SqlExecutor;
  repos: Repositories;
};

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<DatabaseContextValue | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const db = await openAppDatabase();
        if (cancelled) return;
        setValue({ db, repos: createRepositories(db) });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Falha ao abrir o banco');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Não foi possível iniciar</Text>
        <Text style={styles.errorBody}>{error}</Text>
      </View>
    );
  }

  if (!value) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={styles.loading}>Abrindo dados locais…</Text>
      </View>
    );
  }

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabase(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error('useDatabase deve ser usado dentro de DatabaseProvider');
  }
  return ctx;
}

export function useRepositories(): Repositories {
  return useDatabase().repos;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: 24,
    gap: 12,
  },
  loading: {
    color: colors.brandMuted,
    fontSize: 15,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: '700',
  },
  errorBody: {
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
});
