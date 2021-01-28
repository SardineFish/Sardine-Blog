use std::ops::Deref;

pub struct StringBuilder<T> where T : Deref<Target = str> {
    slices: Vec<T>,
    size: usize,
}

impl<T> StringBuilder<T> where T : Deref<Target = str> {
    pub fn new() -> Self {
        Self {
            slices: Default::default(),
            size: 0,
        }
    }
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            slices: Vec::with_capacity(capacity),
            size: 0,
        }
    }
    pub fn push(&mut self, text: T) -> &mut Self {
        self.size += text.len();
        self.slices.push(text);
        self
    }
    pub fn len(&self) -> usize {
        self.size
    }
    pub fn to_string(self) -> String {
        let mut output = String::with_capacity(self.size);
        for slice in self.slices {
            output.push_str(slice.as_ref());
        }
        output
    }
}
