 import { StatusBar } from 'expo-status-bar';
 import { ScreenContent } from 'components/ScreenContent';
 

export default function App() {
  return (
    <>
      <ScreenContent title="Home" path="/app/modal.tsx"></ScreenContent>
      <StatusBar style="auto" />
    </>
  );
}
