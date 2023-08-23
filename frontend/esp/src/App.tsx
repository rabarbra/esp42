import {
    AppShell
}                           from '@mantine/core';
import Main                 from './pages/Main';
import ThemeProvider        from './theme/ThemeProvider';
import MainHeader           from './components/MainHeader';
import {
    ConnectionContextProvider
}                           from './api/ConnectionContext';
import { ImgCtxProvider }   from './components/ImgCtx';

function App() {
    return (
        <ThemeProvider>
            <ConnectionContextProvider>
                <AppShell
                    header={<MainHeader/>}
                >
                    <ImgCtxProvider>
                        <Main/>
                    </ImgCtxProvider>
                </AppShell>
            </ConnectionContextProvider>
        </ThemeProvider>
    );
}

export default App;
