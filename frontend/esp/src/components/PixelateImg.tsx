import {
    Button,
    Stack
}               from "@mantine/core"
import React    from "react"

export type PixelateImgProps = {
    src: string
    width?: number
    height?: number
    pixelSize?: number
    centered?: boolean
    fillTransparencyColor?: string
    clbck?: (pixelArray: number[])=>void
}

const PixelateImg = ({
    src,
    width,
    height,
    pixelSize = 5,
    centered,
    fillTransparencyColor,
    clbck
}: PixelateImgProps) => {
    const [pixelArray, setPixelArray] = React.useState([] as number[]);
    const canvasRef = React.useRef<HTMLCanvasElement>()
    React.useEffect(() => {
        const paintPixels = (
            ctx: CanvasRenderingContext2D,
            img: HTMLImageElement,
            pixelSize?: number,
            centered?: boolean,
            fillTransparencyColor?: string
        ) => {
            let pixelArray: Array<Array<number>> = [];
            if (pixelSize !== undefined && Number.isFinite(pixelSize) && pixelSize > 0) {
                for (let x = 0; x < img.width + pixelSize; x += pixelSize) {
                    for (let y = 0; y < img.height + pixelSize; y += pixelSize) {
                        let xColorPick = x
                        let yColorPick = y
                        
                        if (x >= img.width) {
                            xColorPick = x - (pixelSize - (img.width % pixelSize) / 2) + 1
                        }
                        if (y >= img.height) {
                            yColorPick = y - (pixelSize - (img.height % pixelSize) / 2) + 1
                        }
                      
                        const rgba = ctx.getImageData(xColorPick, yColorPick, 1, 1).data
                        const clr = rgba[3] === 0 ? fillTransparencyColor || "#ffffff"
                            : `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3]})`
                        ctx.fillStyle = clr;
                        if (x !== img.width && y !== img.height)
                        {
                            if (x / pixelSize >= pixelArray.length)
                                pixelArray.push([]);
                            pixelArray[x / pixelSize].push((rgba[0] << 16) + (rgba[1] << 8) + (rgba[2]));
                        }
                        if (centered) {
                            ctx.fillRect(
                                Math.floor(x - (pixelSize - (img.width % pixelSize) / 2)),
                                Math.floor(y - (pixelSize - (img.height % pixelSize) / 2)),
                                pixelSize,
                                pixelSize
                            )
                        } else {
                            ctx.fillRect(x, y, pixelSize, pixelSize)
                        }
                        let resArray: number[] = [];
                        for (let col in pixelArray[0]) {
                            for (let row of pixelArray) {
                                resArray.push(row[col]);
                            }
                        }
                        setPixelArray([...resArray])
                    }
                }
            }
        }
        const pixelate = ({
            src,
            width,
            height,
            pixelSize,
            centered,
            fillTransparencyColor
        }: PixelateImgProps) => {
            let img: HTMLImageElement | undefined = new Image()
            img.crossOrigin = "anonymous"
            img.src = src
    
            img.onload = () => {
                const canvas: HTMLCanvasElement | undefined = canvasRef?.current
                if (canvas && img) {
                    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
                    img.width = width ? width : img.width
                    img.height = height ? height : img.height
                    canvas.width = img.width
                    canvas.height = img.height
                    
                    ctx.drawImage(img, 0, 0, img.width, img.height)
                    paintPixels(ctx, img, pixelSize, centered, fillTransparencyColor)
                    img = undefined
                }
            }
        };
        pixelate({
            src,
            width,
            height,
            pixelSize,
            centered,
            fillTransparencyColor
        })
    }, [src, width, height, pixelSize, centered, fillTransparencyColor])
    return (
        <Stack>
            <canvas ref={canvasRef as React.MutableRefObject<HTMLCanvasElement>} />
            <Button onClick={()=>{
                if (clbck)
                {
                    clbck(pixelArray);
                }
            }}>
                Send
            </Button>
        </Stack>
    )
}

export default PixelateImg;