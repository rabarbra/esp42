import React                from 'react';
import {
    AppShell
}                           from '@mantine/core';
import Main                 from './pages/Main';
import ThemeProvider        from './theme/ThemeProvider';
import MainHeader           from './components/MainHeader';
import {
    ConnectionContextProvider
}                           from './api/ConnectionContext';

function App() {
    return (
        <ThemeProvider>
            <ConnectionContextProvider>
                <AppShell
                    header={<MainHeader/>}
                >
                    <Main/>
                </AppShell>
            </ConnectionContextProvider>
        </ThemeProvider>
    );
}

export default App;
