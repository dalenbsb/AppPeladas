import { useLocalSearchParams, useRouter } from 'expo-router';

import { useRepositories } from '@/db/DatabaseProvider';
import { AtletaForm } from '@/features/atletas/AtletaForm';
import { defaultAtletaFormValues } from '@/features/atletas/defaults';

export default function NovoAtletaScreen() {
  const { peladaId } = useLocalSearchParams<{ peladaId: string }>();
  const router = useRouter();
  const repos = useRepositories();

  return (
    <AtletaForm
      peladaId={peladaId}
      initialValues={defaultAtletaFormValues()}
      submitLabel="Salvar"
      onSubmit={async (values) => {
        await repos.atletas.create(values);
        router.back();
      }}
    />
  );
}
