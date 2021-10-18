import { z } from 'zod';
export declare const Challenge: z.ZodObject<{
    helper: z.ZodString;
    hash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    helper: string;
    hash: string;
}, {
    helper: string;
    hash: string;
}>;
export declare type IChallenge = z.infer<typeof Challenge>;
export declare const Record: z.ZodObject<{
    id: z.ZodString;
    cypher: z.ZodString;
    hash: z.ZodString;
    readChallenges: z.ZodArray<z.ZodObject<{
        helper: z.ZodString;
        hash: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        helper: string;
        hash: string;
    }, {
        helper: string;
        hash: string;
    }>, "many">;
    writeChallenges: z.ZodArray<z.ZodObject<{
        helper: z.ZodString;
        hash: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        helper: string;
        hash: string;
    }, {
        helper: string;
        hash: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    hash: string;
    id: string;
    cypher: string;
    readChallenges: {
        helper: string;
        hash: string;
    }[];
    writeChallenges: {
        helper: string;
        hash: string;
    }[];
}, {
    hash: string;
    id: string;
    cypher: string;
    readChallenges: {
        helper: string;
        hash: string;
    }[];
    writeChallenges: {
        helper: string;
        hash: string;
    }[];
}>;
export declare type IRecord = z.infer<typeof Record>;
export declare const User: z.ZodObject<{
    email: z.ZodString;
    initialDocId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    initialDocId: string;
}, {
    email: string;
    initialDocId: string;
}>;
export declare type IUser = z.infer<typeof User>;
