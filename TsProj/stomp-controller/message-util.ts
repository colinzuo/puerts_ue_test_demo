import { IMessage } from "../stompjs";

export class MessageUtil {
    public static okToReply(inMessage: IMessage) {
        let replyDestination = inMessage.headers.replyDestination;
        let replyAppDestination = inMessage.headers.replyAppDestination;
        let streamId = inMessage.headers.streamId;

        if (replyDestination && replyAppDestination && streamId) {
            return true;
        }

        return false;
    }
}