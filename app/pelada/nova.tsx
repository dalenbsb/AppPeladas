import { useRouter } from 'expo-router';

import { useRepositories } from '@/db/DatabaseProvider';
import { defaultPeladaFormValues } from '@/features/peladas/defaults';
import { PeladaForm } from '@/features/peladas/PeladaForm';
import { usePeladaStore } from '@/features/peladas/peladaStore';

export default function NovaPeladaScreen() {
  const router = useRouter();
  const repos = useRepositories();
  const bump = usePeladaStore((s) => s.bump);

  return (
    <PeladaForm
      initialValues={defaultPeladaFormValues()}
      submitLabel="Salvar"
      onSubmit={async (values) => {
        await repos.peladas.create(values);
        bump();
        router.replace('/');
      }}
    />
  );
}
