import { notFound } from 'next/navigation';
import DashboardLayout from '../DashboardLayout';
import Feature from '../Feature';
import Departamentos from '../Departamentos';
import Residentes from '../Residentes';
import Expensas from '../Expensas';
import Reservaciones from '../Reservaciones'

const sectionComponents = {
  feature: Feature,
  departamentos: Departamentos,
  residentes: Residentes,
  expensas: Expensas,
  reservaciones: Reservaciones,
};

export default function DashboardSection({ params }) {
  const { section } = params;
  const SectionComponent = sectionComponents[section];

  if (!SectionComponent) {
    notFound();
  }

  return (
    <DashboardLayout>
      <SectionComponent />
    </DashboardLayout>
  );
}