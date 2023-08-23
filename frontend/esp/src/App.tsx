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
            <ImgCtxProvider>
                <ConnectionContextProvider>
                    <AppShell
                        header={<MainHeader/>}
                    >
                        <Main/>
                    </AppShell>
                </ConnectionContextProvider>
            </ImgCtxProvider>
        </ThemeProvider>
    );
}

export default App;
