import CreateCompanyDialog from '../CreateCompanyDialog';

export default function CreateCompanyDialogExample() {
  return (
    <CreateCompanyDialog onSubmit={(data) => console.log('Submitted:', data)} />
  );
}
