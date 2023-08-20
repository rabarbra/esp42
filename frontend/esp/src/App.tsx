import {
    AppShell
}                       from '@mantine/core';
import Main             from './pages/Main';
import ThemeProvider    from './theme/ThemeProvider';
import MainHeader       from './components/MainHeader';

function App() {
    return (
        <ThemeProvider>
            <AppShell
                header={<MainHeader/>}
            >
                <Main/>
            </AppShell>
        </ThemeProvider>
    );
}

export default App;
