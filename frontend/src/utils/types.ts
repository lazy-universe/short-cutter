export type ClipMetadata = {
  title: string;
  description: string;
  tags: string[];
  timestamps: [number, number];
  hook: string;
  mood: string;
};

export type ResponseData =
  | {
      message: string;
      videos: string[];
      timestamp: ClipMetadata[];
      time_taken: number;
    }
  | {
      status: string;
      message: string;
      content: string;
    };

export type SSEConsoleProps = {
  darkMode: boolean;
  loading: boolean;
};

export type InputHandlerProps = {
  darkMode: boolean;
};

export type FormValues = {
  clipCount: number;
  maxDuration: number;
  quality: 480 | 720 | 1080 | 1440;
  cache: boolean;
  highlightKeyword: string;
};

export type Props = {
  darkMode: boolean;
  onChange: (values: FormValues) => void;
};

export type ResponseMsgProps = {
  error: string | null;
  darkMode: boolean;
  responseMsg: ResponseData | null;
  loading: boolean;

};

export type LoginProps = {
    onLoginSuccess: (name: string) => void;
}