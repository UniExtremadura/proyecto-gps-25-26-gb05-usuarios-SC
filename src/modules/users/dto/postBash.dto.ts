import {ArrayUnique, IsArray, IsNotEmpty, IsString} from "class-validator";

export class postBashDto {
    @ArrayUnique()
    @IsArray()
    @IsNotEmpty()
    uuids: string[]
}