use std::{
    sync::{
        mpsc::{sync_channel, Receiver, SyncSender},
        Mutex,
    },
    thread::spawn,
};

use chrono::{DateTime, Duration, NaiveDateTime, TimeZone, Utc};
use log::{Level, Metadata, Record};
use sar_blog::{ErrorRecord, Service};
use shared::ServiceOptions;

struct ErrorReportBuffer {
    buffer_timeout: Duration,
    records: Vec<ErrorRecord>,
    last_report_time: DateTime<Utc>,
}

impl ErrorReportBuffer {
    pub fn fetch_records(&mut self) -> Vec<ErrorRecord> {
        if Utc::now() - self.last_report_time >= self.buffer_timeout {
            let buffer = std::mem::take(&mut self.records);
            if !buffer.is_empty() {
                self.last_report_time = Utc::now();
            }
            buffer
        } else {
            Vec::new()
        }
    }
}

pub struct ServiceMornitor {
    report_sender: SyncSender<Vec<ErrorRecord>>,
    error_buffer: Mutex<ErrorReportBuffer>,
    logger: env_logger::Logger,
}

impl ServiceMornitor {
    fn new(options: &ServiceOptions, sender: SyncSender<Vec<ErrorRecord>>) -> Self {
        Self {
            error_buffer: Mutex::new(ErrorReportBuffer {
                buffer_timeout: options.report_interval,
                last_report_time: Utc
                    .from_utc_datetime(&NaiveDateTime::from_timestamp_millis(0).unwrap()),
                records: Default::default(),
            }),
            report_sender: sender,
            logger: env_logger::Builder::from_env(
                env_logger::Env::default().default_filter_or("info"),
            )
            .build(),
        }
    }
    pub fn init(options: &ServiceOptions, service: Service) {
        let (sender, receiver) = sync_channel::<Vec<ErrorRecord>>(16);
        let mornitor = Box::new(Self::new(options, sender));

        let reporter = ReportSender { receiver, service };

        let max_level = mornitor.logger.filter();
        log::set_boxed_logger(mornitor).unwrap();

        log::set_max_level(max_level);

        spawn(move || reporter.run());
    }
}

impl log::Log for ServiceMornitor {
    fn enabled(&self, metadata: &Metadata) -> bool {
        self.logger.enabled(metadata)
    }
    fn log(&self, record: &Record) {
        self.logger.log(record);

        if record.level() == Level::Error {
            let records = {
                let mut buffer = self.error_buffer.lock().unwrap();
                buffer.records.push(ErrorRecord {
                    level: record.level(),
                    module: record.module_path().unwrap_or_default().to_owned(),
                    msg: record.args().to_string(),
                    time: Utc::now(),
                });
                buffer.fetch_records()
            };
            if !records.is_empty() {
                let result = self.report_sender.send(records);
                if let Err(err) = result {
                    log::error!("Failed to send error reports through channel: {:?}", err);
                }
            }
        }
    }
    fn flush(&self) {
        self.logger.flush()
    }
}

struct ReportSender {
    receiver: Receiver<Vec<ErrorRecord>>,
    service: Service,
}

impl ReportSender {
    fn run(self) {
        actix_web::rt::System::new().block_on(async move {
            log::info!("Error report sender is running.");
            loop {
                if let Ok(records) = self.receiver.recv() {
                    log::info!("Sent {} reports", records.len());
                    let result = self
                        .service
                        .push_service()
                        .send_error_report(&self.service.option.report_address, records)
                        .await;
                    if let Err(err) = result {
                        log::error!("Failed to send error report: {:?}", err);
                    }
                }
            }
        });
    }
}
