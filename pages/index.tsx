import { Box } from '@mui/material';
import BackImage from '../components/BackImage';
import { Main } from '../components/Content';
import Home from '../components/Home';

export default function Head() {
    return (
        <Box display='flow-root'>
            <BackImage />
            <Box position='fixed' width='100vw' height='100vh' bgcolor='rgba(0,0,0,0.5)' />

            <Main>
                <Home />
            </Main>
        </Box>
    );
}
