import './styles/file-input.scss';
import { dragEvent, getClassName } from 'lib/helpers';
import { fileSizeDisplay } from './helpers/file-size-display';
import { Input, InputProps } from 'lib/inputs';
import { ReactNode, useEffect, useRef, useState } from 'react';

export type FileDropZoneProps = {
    dropZoneText?: ReactNode
    multiple?: boolean | number
    multipleMin?: number
    onFileChange?: (files: File[]) => void
} & InputProps;

export function FileDropZone(
    {
        className,
        dropZoneText = 'Drop Files Here',
        multiple,
        multipleMin,
        required,
        onFileChange,
        ...props
    }: FileDropZoneProps
) {

    const fileLimit = typeof multiple === 'number'
        ? multiple
        : 1;
    const fileLimitMin = multipleMin || required && 1 || 0;

    const [files, setFiles] = useState(new Map<string, File>());
    const [ready, isReady] = useState(true);

    const dropZoneRef = useRef(null as null | HTMLDivElement);

    useEffect(() => {
        if (!ready)
            isReady(true);
    }, [ready]);

    const onDrop = dragEvent<HTMLDivElement>((e) => {
        e.preventDefault();

        const cache = files;
        let didUpdate = false;

        if (e.dataTransfer.items) {
            [...e.dataTransfer.items].forEach((item) => {
                if (item.kind === 'file') {
                    const f = item.getAsFile();
                    if (f && cache.size < fileLimit) {
                        cache.set(f.name, f);
                        didUpdate = true;
                    }
                }
            });
        }
        else {
            [...e.dataTransfer.files].forEach((file) => {
                if (cache.size < fileLimit) {
                    cache.set(file.name, file);
                    didUpdate = true;
                }
            });
        }

        if (didUpdate) {
            setFiles(cache);
            isReady(false);

            if (onFileChange)
                onFileChange(Array.from(cache.values()));
        }
    });

    const onDragOver = dragEvent((e) => e.preventDefault());

    const onDragEnter = dragEvent(() => {
        if (!dropZoneRef.current)
            return;

        dropZoneRef.current.classList.add('dragged');
    });
    const onDragLeave = dragEvent(() => {
        if (!dropZoneRef.current)
            return;

        dropZoneRef.current.classList.remove('dragged');
    });

    return <div
        className={getClassName('file-input', className)}
    >
        <div
            className='file-drop-zone-wrapper f-body'
        >
            <div
                className='file-drop-zone f-main'
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
                ref={dropZoneRef}
            >
                <span
                    className='label drop-zone-text'
                >
                    {dropZoneText}
                </span>

                <span
                    className='label allow-multiple-files'
                >
                    {fileLimit > 1 && `Limit: ${multiple}`}
                </span>

                <span
                    className='label allow-multiple-files'
                >
                    {fileLimitMin > 0 && `Required: ${fileLimitMin}`}
                </span>
            </div>
        </div>

        <Input
            className='file'
            multiple={fileLimit > 1}
            required={required}
            {...props}
            type='file'
        />

        {
            ready && files.size > 0 &&
            <div
                className='dropped-files'
            >
                <ul
                    className='dropped-file-list'
                >
                    {
                        Array.from(files).map(([key, file]) => {
                            return <li
                                key={key}
                                className='dropped-file'
                            >
                                <span>
                                    {key}
                                </span>

                                <span>
                                    {fileSizeDisplay(file.size)}
                                </span>
                            </li>;
                        })
                    }
                </ul>
            </div>
        }
    </div >;
}