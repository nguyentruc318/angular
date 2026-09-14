import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxSonnerToaster } from 'ngx-sonner';
import { App } from './app';

@Component({ selector: 'ngx-sonner-toaster', template: '' })
class ToasterStub {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .overrideComponent(App, {
        remove: { imports: [NgxSonnerToaster] },
        add: { imports: [ToasterStub] },
      })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the router outlet and toast host', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
    expect(compiled.querySelector('ngx-sonner-toaster')).not.toBeNull();
  });
});
