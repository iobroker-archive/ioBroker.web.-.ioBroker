import React, { Component } from 'react';
import Dropzone from 'react-dropzone';

import { Box } from '@mui/material';

import { type AdminConnection, I18n } from '@iobroker/adapter-react-v5';

import { Toast } from '../Components/Toast';
import { CustomCheckbox } from '../Components/CustomCheckbox';
import { CustomInput } from '../Components/CustomInput';
import { CustomButtonUpload } from '../Components/CustomButtonUpload';
import type { WebAdapterConfig } from '../types';

const styles: Record<string, any> = {
    tab: {
        width: '100%',
        minHeight: '100%',
    },
    column: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginRight: 20,
    },
    columnSettings: {
        width: 'calc(100% - 10px)',
    },
    dropZone: {
        mt: '30px',
        width: 600,
        border: '2px dashed #bbb',
        borderRadius: '5px',
        p: '25px',
        textAlign: 'center',
        fontSize: '20pt',
        fontWeight: 'bold',
        fontFamily: 'Arial',
        color: '#bbb',
        minWidth: 320,
        minHeight: 200,
        transition: 'background 1s',
        '&:focus': {
            outline: 'inherit',
        },
        '@media screen and (max-width: 680px)': {
            width: 'calc(100% - 45px)',
            minWidth: 200,
            '& img': {
                width: '100%',
            },
        },
    },
    dropZoneActive: {
        background: '#d6d6d69c',
    },
    imgStyle: {
        maxWidth: 500,
        maxHeight: 500,
    },
};

interface BackgroundProps {
    native: WebAdapterConfig;
    instance: number;
    onChange: (attr: string, value: any, cb?: () => void) => void;
    socket: AdminConnection;
}

interface BackgroundState {
    imgSRC: string;
    toast: string;
}

export default class Background extends Component<BackgroundProps, BackgroundState> {
    constructor(props: BackgroundProps) {
        super(props);
        this.state = {
            imgSRC: '',
            toast: '',
        };
    }

    componentDidMount(): void {
        this.readFile();
    }

    readFile(): void {
        const { socket, instance } = this.props;

        socket
            .getRawSocket()
            .emit('readFile', `web.${instance}`, 'login-bg.png', (err: Error | null, data?: Buffer): void => {
                if (!err && data) {
                    const arrayBufferView = new Uint8Array(data);
                    if (!arrayBufferView.length) {
                        this.setState({ imgSRC: `../../files/web.${instance}/login-bg.png?ts=${Date.now()}` });
                    } else {
                        const blob = new Blob([arrayBufferView], { type: 'image/png' });
                        const urlCreator = window.URL || window.webkitURL;
                        const imgSRC = urlCreator.createObjectURL(blob);
                        this.setState({ imgSRC });
                    }
                } else {
                    this.setState({ imgSRC: '' });
                }
            });
    }

    uploadFile(file: File, callback?: (fileName: string) => void): void {
        const { socket, instance } = this.props;
        if (!file) {
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.setState({ toast: `File ${file.name} is too big. Maximum 5MB` });
            this.setState({ imgSRC: '' });
            if (callback) {
                callback('');
            }
            return;
        }
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>): void => {
            socket
                .getRawSocket()
                .emit('writeFile', `web.${instance}`, 'login-bg.png', e.target?.result, () => this.readFile());
        };
        if (callback) {
            callback(file.name);
        }
        reader.readAsArrayBuffer(file);
    }

    render(): React.JSX.Element {
        const { native, onChange } = this.props;
        const { imgSRC, toast } = this.state;
        return (
            <form style={styles.tab}>
                <Toast
                    message={toast}
                    onClose={() => this.setState({ toast: '' })}
                />
                <div style={{ ...styles.column, ...styles.columnSettings }}>
                    <div>
                        <CustomInput
                            styleComponentBlock={{
                                height: 20,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            component={
                                <CustomInput
                                    attr="loginBackgroundColorHelper"
                                    type="color"
                                    style={{ marginTop: -1, marginLeft: 10, minWidth: 60 }}
                                    native={native}
                                    onChange={(_e, value) =>
                                        onChange('loginBackgroundColorHelper', value, () =>
                                            onChange('loginBackgroundColor', value),
                                        )
                                    }
                                    variant="outlined"
                                    size="small"
                                />
                            }
                            title="color"
                            attr="loginBackgroundColor"
                            style={{ marginTop: -1, marginBottom: 20 }}
                            native={native}
                            onChange={(e, value) =>
                                onChange('loginBackgroundColorHelper', value, () =>
                                    onChange('loginBackgroundColor', value),
                                )
                            }
                        />
                    </div>
                    <div>
                        <CustomCheckbox
                            title="background_image"
                            attr="loginBackgroundImage"
                            native={native}
                            onChange={onChange}
                        />
                    </div>
                    <div style={native.loginBackgroundImage ? { display: 'block' } : { display: 'none' }}>
                        <div>
                            <CustomButtonUpload
                                title="upload_image"
                                onChange={(e, callback) => this.uploadFile(e, callback)}
                            />
                        </div>
                        <Dropzone
                            accept={{ 'image/*': [] }}
                            onDrop={acceptedFiles => this.uploadFile(acceptedFiles[0])}
                        >
                            {({ getRootProps, getInputProps, isDragActive }) => (
                                <section>
                                    <Box
                                        component="div"
                                        sx={{
                                            ...styles.dropZone,
                                            ...(isDragActive ? styles.dropZoneActive : undefined),
                                        }}
                                        {...getRootProps()}
                                    >
                                        <input {...getInputProps()} />
                                        <p>{I18n.t('place_the_files_here')}</p>
                                        {imgSRC ? (
                                            <img
                                                style={styles.imgStyle}
                                                src={imgSRC}
                                                alt="img"
                                            />
                                        ) : null}
                                    </Box>
                                </section>
                            )}
                        </Dropzone>
                    </div>
                </div>
            </form>
        );
    }
}
