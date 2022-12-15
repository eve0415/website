import { Card, Chip, Flex, Grid, Loader, Text, Title } from '@mantine/core';
import Link from 'next/link';
import ripplet from 'ripplet.js';
import { CustomImageProxy } from '../CustomImageProxy';
import type { Project } from '../works';
import { Tag } from './Tag';

import { useState } from 'react';
import styles from './card.module.css';

export const WorkCard = ({ project }: { project: Project }) => {
    const { name, description, image, language, tag, link } = project;
    const [loading, setLoading] = useState(true);

    return (
        <Grid.Col key={name} span='content'>
            <Card w={300} h={400} withBorder>
                <Card.Section>
                    {loading && <Loader variant='bars' fontSize='1px' pos='absolute' h={150} w={300} />}
                    <CustomImageProxy
                        src={image}
                        alt={name}
                        height={150}
                        width={300}
                        style={{
                            objectFit: /opengraph.githubassets.com/.test(image) ? 'contain' : 'cover',
                            borderRadius: 5,
                        }}
                        onLoadingComplete={() => setLoading(false)}
                    />
                </Card.Section>

                <Title order={3} size='1.5rem'>
                    {name}
                </Title>

                <Chip.Group position='center' mb={10}>
                    <Chip variant='filled'>{language}</Chip>
                    {tag?.map(t => (
                        <Tag tagId={t} key={t} />
                    ))}
                </Chip.Group>

                <Text>{description}</Text>

                <Card.Section>
                    <Flex pos='absolute' justify='center' w='100%' bottom={0}>
                        {link.map(({ name: linkName, url, svg }) => (
                            <Link
                                href={url}
                                key={linkName}
                                aria-label={linkName}
                                target='_blank'
                                className={styles.work}
                                rel='noopener noreferrer'
                                style={{
                                    fontSize: '1.5rem',
                                    boxSizing: 'content-box',
                                    padding: 10,
                                    marginBottom: 6,
                                    width: '1.5rem',
                                    height: '1.5rem',
                                    borderRadius: '1.5rem',
                                    verticalAlign: 'top',
                                }}
                                onPointerDown={event => ripplet(event, { clearing: false })}
                                onPointerUp={() => ripplet.clear()}
                                onPointerLeave={() => ripplet.clear()}
                            >
                                {svg}
                            </Link>
                        ))}
                    </Flex>
                </Card.Section>
            </Card>
        </Grid.Col>
    );
};
