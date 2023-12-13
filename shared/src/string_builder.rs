use std::{fmt::Display, ops::Deref};

pub struct StringBuilder<T>
where
    T: Deref<Target = str>,
{
    slices: Vec<T>,
    size: usize,
}

impl<T> StringBuilder<T>
where
    T: Deref<Target = str>,
{
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

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
}

impl<T> Default for StringBuilder<T>
where
    T: Deref<Target = str>,
{
    fn default() -> Self {
        Self::new()
    }
}

impl<T> Display for StringBuilder<T>
where
    T: Deref<Target = str>,
{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut output = String::with_capacity(self.size);
        for slice in &self.slices {
            output.push_str(slice.as_ref());
        }
        f.write_str(&output)
    }
}
