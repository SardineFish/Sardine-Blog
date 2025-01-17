use std::fmt::Display;

macro_rules! impl_error_log {
    () => {
        #[allow(unused_must_use)]
        fn log_consume(self, level: log::Level, target: &str) {
            self.log(level, target);
        }
        fn log_error(self: Self, target: &str) -> Self {
            self.log(log::Level::Error, target)
        }
        #[allow(unused_must_use)]
        fn log_error_consume(self, target: &str) {
            self.log_error(target);
        }
        fn log_warn(self, target: &str) -> Self {
            self.log(log::Level::Warn, target)
        }
        #[allow(unused_must_use)]
        fn log_warn_consume(self, target: &str) {
            self.log_warn(target);
        }
        fn log_info(self, target: &str) -> Self {
            self.log(log::Level::Info, target)
        }
        #[allow(unused_must_use)]
        fn log_info_consume(self, target: &str) {
            self.log_info(target);
        }
        fn log_debug(self, target: &str) -> Self {
            self.log(log::Level::Debug, target)
        }
        #[allow(unused_must_use)]
        fn log_debug_consume(self, target: &str) {
            self.log_info(target);
        }
    };
}

pub trait LogError {
    fn log(self, level: log::Level, target: &str) -> Self;
    fn log_consume(self, level: log::Level, target: &str);
    fn log_error(self, target: &str) -> Self;
    fn log_error_consume(self, target: &str);
    fn log_warn(self, target: &str) -> Self;
    fn log_warn_consume(self, target: &str);
    fn log_info(self, target: &str) -> Self;
    fn log_info_consume(self, target: &str);
    fn log_debug(self, target: &str) -> Self;
    fn log_debug_consume(self, target: &str);
}

impl<T, E> LogError for Result<T, E>
where
    E: Display,
{
    fn log(self, level: log::Level, target: &str) -> Self {
        if let Err(err) = &self {
            log::log!(level, "[{}] {}", target, err)
        }
        self
    }
    impl_error_log!();
}
