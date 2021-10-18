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
export declare const RecordContent: z.ZodObject<{
    content: z.ZodString;
    hash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    hash: string;
    content: string;
}, {
    hash: string;
    content: string;
}>;
export declare type IRecordContent = z.infer<typeof RecordContent>;
export declare const RecordChallenges: z.ZodObject<{
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
    readChallenges: {
        helper: string;
        hash: string;
    }[];
    writeChallenges: {
        helper: string;
        hash: string;
    }[];
}, {
    readChallenges: {
        helper: string;
        hash: string;
    }[];
    writeChallenges: {
        helper: string;
        hash: string;
    }[];
}>;
export declare type IRecordChallenges = z.infer<typeof RecordChallenges>;
export declare const Record: z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>, z.ZodObject<{
    content: z.ZodString;
    hash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    hash: string;
    content: string;
}, {
    hash: string;
    content: string;
}>>, z.ZodObject<{
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
    readChallenges: {
        helper: string;
        hash: string;
    }[];
    writeChallenges: {
        helper: string;
        hash: string;
    }[];
}, {
    readChallenges: {
        helper: string;
        hash: string;
    }[];
    writeChallenges: {
        helper: string;
        hash: string;
    }[];
}>>;
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
