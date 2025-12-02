import {ArrayUnique, IsArray, IsNotEmpty} from "class-validator";

export class PostBashDto {
    @ArrayUnique()
    @IsArray()
    @IsNotEmpty()
    uuids: string[]
}