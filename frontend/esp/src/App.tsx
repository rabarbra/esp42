import React                from 'react';
import {
    AppShell
}                           from '@mantine/core';
import Main                 from './pages/Main';
import ThemeProvider        from './theme/ThemeProvider';
import MainHeader           from './components/MainHeader';
import ConnectionContext    from './api/ConnectionContext';

function App() {
    const [connected, setConnected] = React.useState(false);
    const [espId, setEspId] = React.useState("");
    const ctx = {
        connected:  connected,
        espId:      espId,
        setEspId:   setEspId,
        connect:    setConnected
    }
    return (
        <ThemeProvider>
            <ConnectionContext.Provider value={ctx}>
                <AppShell
                    header={<MainHeader/>}
                >
                    <Main/>
                </AppShell>
            </ConnectionContext.Provider>
        </ThemeProvider>
    );
}

export default App;
