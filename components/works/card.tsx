import {
    Avatar,
    Box,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Chip,
    IconButton,
    SvgIcon,
} from '@mui/material';
import Link from 'next/link';
import { CloudflareImage } from '../CloudflareLoader';
import type { Project } from '../constants/projects/project';
import { CreateTag } from './tag';

export function CreateCard({ project }: { project: Project }) {
    const { name, description, image, language, tag, link } = project;

    return (
        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 300,
                height: 400,
                border: '0.5px solid rgba(0,0,0, 0.25)',
                position: 'relative',
            }}
        >
            <Avatar variant='rounded' sx={{ width: '95%', height: '35.5%', bgcolor: 'white' }}>
                <CloudflareImage
                    src={image}
                    alt='project'
                    layout='fill'
                    objectFit='cover'
                    sizes='283px'
                    priority
                />
            </Avatar>

            <CardHeader title={name} />

            <Box>
                <Chip size='small' label={language} />
                {tag?.map(t => (
                    <CreateTag tagId={t} key={t} />
                ))}
            </Box>

            <CardContent>{description}</CardContent>

            <CardActions sx={{ position: 'absolute', bottom: 0 }}>
                {link.map(({ name: linkName, url, svg }) => (
                    <Link href={url} key={linkName} passHref>
                        <IconButton target='_blank' rel='noopener noreferrer' href=''>
                            <SvgIcon viewBox='0 0 128 128'>{svg}</SvgIcon>
                        </IconButton>
                    </Link>
                ))}
            </CardActions>
        </Card>
    );
}
