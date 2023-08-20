import React        from "react";
import {
    Group,
    Text
}                   from "@mantine/core";
import {
    Dropzone,
    FileWithPath,
    IMAGE_MIME_TYPE
}                   from "@mantine/dropzone";
import PixelateImg  from "./PixelateImg";
import { sendArray } from "../api/api";

const DropImg = () => {
    const [files, setFiles] = React.useState<FileWithPath[]>([]);
    const previews = files.map((file, index) => {
        const imageUrl = URL.createObjectURL(file);
        return (
            <PixelateImg
                key={index}
                src={imageUrl}
                width={320}
                height={320}
                pixelSize={40}
                clbck={sendArray}
            />
        );
    });
    return (
        <div>
            <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setFiles}>
                <Text align="center">Drop images here</Text>
            </Dropzone>
            <Group
                mt={previews.length > 0 ? 'xl' : 0}
            >
                {previews}
            </Group>
        </div>
    );
  }

export default DropImg;
  